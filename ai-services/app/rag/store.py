"""
RAG embedding store — pgvector-based vector storage for user context.

Stores and retrieves embedded chunks scoped by user_id. Uses LangChain's
embedding interface with Google Generative AI embeddings.

If DATABASE_URL is not set, all operations gracefully no-op so the chat
endpoint still works (just without retrieval context).
"""

import logging
from typing import List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Lazy-init — only connect when actually used
_store_initialized = False
_embeddings = None
_pool = None


def _get_embeddings():
    """Lazy-init the embedding model."""
    global _embeddings
    if _embeddings is None:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        _embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.GEMINI_API_KEY,
        )
    return _embeddings


async def _get_pool():
    """Lazy-init the async connection pool."""
    global _pool
    if _pool is None:
        db_url = getattr(settings, "DATABASE_URL", None)
        if not db_url:
            return None
        try:
            import asyncpg
            _pool = await asyncpg.create_pool(db_url, min_size=1, max_size=5)
        except Exception as e:
            logger.warning("Could not create pgvector pool: %s", e)
            return None
    return _pool


async def ensure_table():
    """Create the embeddings table and vector extension if they don't exist."""
    pool = await _get_pool()
    if pool is None:
        return False
    try:
        async with pool.acquire() as conn:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS rag_embeddings (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    source_id TEXT,
                    chunk_text TEXT NOT NULL,
                    embedding vector(768),
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_rag_user_id
                ON rag_embeddings (user_id);
            """)
        global _store_initialized
        _store_initialized = True
        return True
    except Exception as e:
        logger.error("Failed to ensure RAG table: %s", e)
        return False


async def store_chunks(
    user_id: str,
    chunks: List[str],
    source_type: str,
    source_id: str = None,
) -> int:
    """
    Embed and store text chunks for a user.
    source_type: 'resume' | 'interview' | 'roadmap'
    Returns number of chunks stored.
    """
    pool = await _get_pool()
    if pool is None:
        return 0

    if not _store_initialized:
        await ensure_table()

    embeddings_model = _get_embeddings()

    try:
        vectors = await embeddings_model.aembed_documents(chunks)
    except Exception as e:
        logger.error("Embedding failed: %s", e)
        return 0

    stored = 0
    async with pool.acquire() as conn:
        for chunk, vec in zip(chunks, vectors):
            try:
                vec_str = "[" + ",".join(str(v) for v in vec) + "]"
                await conn.execute(
                    """
                    INSERT INTO rag_embeddings (user_id, source_type, source_id, chunk_text, embedding)
                    VALUES ($1, $2, $3, $4, $5::vector)
                    """,
                    user_id, source_type, source_id, chunk, vec_str,
                )
                stored += 1
            except Exception as e:
                logger.error("Failed to store chunk: %s", e)

    return stored


async def retrieve(
    user_id: str,
    query: str,
    top_k: int = 5,
) -> List[str]:
    """
    Retrieve the top-k most relevant chunks for a user's query.
    Always scoped to user_id — never cross-user retrieval.
    Returns empty list if RAG is not available.
    """
    pool = await _get_pool()
    if pool is None:
        return []

    if not _store_initialized:
        ok = await ensure_table()
        if not ok:
            return []

    embeddings_model = _get_embeddings()

    try:
        query_vec = await embeddings_model.aembed_query(query)
    except Exception as e:
        logger.error("Query embedding failed: %s", e)
        return []

    vec_str = "[" + ",".join(str(v) for v in query_vec) + "]"

    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT chunk_text
                FROM rag_embeddings
                WHERE user_id = $1
                ORDER BY embedding <=> $2::vector
                LIMIT $3
                """,
                user_id, vec_str, top_k,
            )
        return [row["chunk_text"] for row in rows]
    except Exception as e:
        logger.error("RAG retrieval failed: %s", e)
        return []


async def delete_user_chunks(user_id: str, source_type: str = None) -> int:
    """Delete all chunks for a user, optionally filtered by source_type."""
    pool = await _get_pool()
    if pool is None:
        return 0

    try:
        async with pool.acquire() as conn:
            if source_type:
                result = await conn.execute(
                    "DELETE FROM rag_embeddings WHERE user_id = $1 AND source_type = $2",
                    user_id, source_type,
                )
            else:
                result = await conn.execute(
                    "DELETE FROM rag_embeddings WHERE user_id = $1",
                    user_id,
                )
        # asyncpg returns 'DELETE N'
        return int(result.split()[-1]) if result else 0
    except Exception as e:
        logger.error("Failed to delete chunks: %s", e)
        return 0

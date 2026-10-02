"""
Chat graph: retrieve -> respond (streaming)

Uses get_streaming_model() from core/llm.py for the response generation.
Retrieval pulls relevant chunks from the user's own data via pgvector
(resume, interview feedback, roadmap) — never cross-user.

If RAG is not available (no DATABASE_URL), the chat still works — it just
doesn't have retrieval context injected into the prompt.
"""

import logging
from typing import List

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.core.llm import get_streaming_model
from app.rag.store import retrieve

logger = logging.getLogger(__name__)


async def stream_chat(
    messages: List[dict],
    system: str,
    user_id: str = None,
):
    """
    Replaces ChatOrchestrator.stream() + StreamAgent.run() +
    LLMService.stream_chat().

    Yields SSE-formatted tokens: 'data: <token>\n\n', ends with 'data: [DONE]\n\n'.
    """
    # Build the message list
    lc_messages = [SystemMessage(content=system)]

    # RAG retrieval: use the last user message as the query
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "")
            break

    if user_id and last_user_msg:
        try:
            retrieved_chunks = await retrieve(user_id=user_id, query=last_user_msg, top_k=5)
            if retrieved_chunks:
                context = "\n\n".join(retrieved_chunks)
                lc_messages.append(
                    SystemMessage(
                        content=(
                            "Here is relevant context from the user's past data "
                            "(resume, interview history, roadmap). Use it to give "
                            "personalized advice when relevant:\n\n"
                            f"{context}"
                        )
                    )
                )
        except Exception as e:
            logger.warning("RAG retrieval failed, continuing without context: %s", e)

    # Add conversation history
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_messages.append(AIMessage(content=content))

    # Stream the response
    model = get_streaming_model()

    try:
        async for chunk in model.astream(lc_messages):
            token = ""
            if hasattr(chunk, "content"):
                token = chunk.content or ""
            elif isinstance(chunk, str):
                token = chunk

            if token:
                yield f"data: {token}\n\n"
    except Exception as e:
        logger.error("Chat streaming failed: %s", e)
        yield "data: Sorry, I'm having trouble connecting right now.\n\n"
    finally:
        yield "data: [DONE]\n\n"

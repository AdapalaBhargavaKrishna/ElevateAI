import logging
from typing import Literal, Type, TypeVar

from langchain_core.runnables import Runnable
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

GROQ_MODEL = "openai/gpt-oss-20b"

Task = Literal["resume", "interview", "roadmap", "assessment", "chat"]

GROQ_PRIMARY_TASKS: set = {"resume", "chat"}


def _build_groq(temperature: float, max_tokens: int) -> ChatGroq:
    return ChatGroq(
        model=GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def _build_gemini(temperature: float, max_tokens: int) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.LLM_MODEL,
        api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=max_tokens,
    )


def get_chat_model(
    task: Task,
    temperature: float = 0.1,
    max_tokens: int = 2048,
) -> Runnable:
    """
    Returns a chat model for the given task, with automatic fallback to the
    other provider on any error (auth, 429, 503, timeout, etc.).

    task="resume" or task="chat"            -> Groq primary, Gemini fallback
    task="interview"/"roadmap"/"assessment" -> Gemini primary, Groq fallback

    This replaces _is_auth_error / _is_transient_error / the manual
    exponential-backoff loops / _call_llm / _call_gemini from the old client.
    """
    groq = _build_groq(temperature, max_tokens)
    gemini = _build_gemini(temperature, max_tokens)

    if task in GROQ_PRIMARY_TASKS:
        return groq.with_fallbacks([gemini])
    return gemini.with_fallbacks([groq])


def get_structured_llm(
    schema: Type[T],
    task: Task,
    temperature: float = 0.1,
    max_tokens: int = 2048,
) -> Runnable:
    """
    Returns a Runnable that takes a prompt (str or messages) and returns an
    already-validated instance of `schema`, using the right primary provider
    for `task`.

    Replaces _clean_json / _parse_json_safe / _validate_json + the
    MAX_RETRIES=3 manual repair loop from generate_json().
    """
    llm = get_chat_model(task=task, temperature=temperature, max_tokens=max_tokens)
    return llm.with_structured_output(schema)


def get_streaming_model(temperature: float = 0.7, max_tokens: int = 1024) -> Runnable:
    """
    Chat model tuned for the streaming assistant endpoint. Always Groq
    primary — speed matters most for a live chat UI — falling back to
    Gemini automatically if Groq errors.
    """
    return get_chat_model(task="chat", temperature=temperature, max_tokens=max_tokens)
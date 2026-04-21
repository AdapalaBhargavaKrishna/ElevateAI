import os
import json
import logging
import re
import time
from groq import Groq
from dotenv import load_dotenv
from google import genai

from app.config import settings

load_dotenv()

logger = logging.getLogger(__name__)

_gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)


class LLMService:
    """
    Groq-based LLM for resume analysis.
    Has self-correction: if LLM returns invalid JSON it retries automatically.
    """

    MAX_RETRIES = 3

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables.")
        self.client = Groq(api_key=api_key)
        self.gemini_client = _gemini_client

    def _call_llm(self, messages: list) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.1,
            max_tokens=2048,
        )
        return response.choices[0].message.content

    def _call_gemini(self, messages: list) -> str:
        prompt = "\n\n".join(
            f"{message['role'].upper()}: {message['content']}"
            for message in messages
        )
        response = self.gemini_client.models.generate_content(
            model=settings.LLM_MODEL,
            contents=prompt
        )
        return response.text

    def _clean_json(self, text: str) -> str:
        return re.sub(r'```json|```', '', text).strip()

    def _is_auth_error(self, error_text: str) -> bool:
        lowered = error_text.lower()
        return any(
            token in lowered for token in (
                "invalid api key",
                "api key not valid",
                "unauthorized",
                "authentication",
                "forbidden",
            )
        ) or "401" in lowered
    
    def _is_transient_error(self, error_text: str) -> bool:
        """Check if error is temporary (rate limit, service overload, etc)"""
        lowered = error_text.lower()
        return any(
            token in lowered for token in (
                "503",
                "unavailable",
                "rate limit",
                "429",
                "too many requests",
                "temporarily unavailable",
                "high demand",
            )
        )

    def _validate_json(self, text: str, expected_keys: list = None):
        try:
            cleaned = self._clean_json(text)
            data = json.loads(cleaned)
            if expected_keys:
                missing = [k for k in expected_keys if k not in data]
                if missing:
                    return False, f"Missing required keys: {missing}"
            return True, ""
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {str(e)}"

    def generate(self, prompt: str) -> str:
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant. Be concise and accurate."},
            {"role": "user", "content": prompt}
        ]
        try:
            return self._call_llm(messages)
        except Exception as exc:
            error_str = str(exc)
            if self._is_auth_error(error_str):
                logger.warning("Groq auth failed in generate(); falling back to Gemini.")
                transient_attempts = 0
                max_transient_attempts = 3
                
                while transient_attempts < max_transient_attempts:
                    try:
                        return self._call_gemini(messages)
                    except Exception as gemini_exc:
                        gemini_error_str = str(gemini_exc)
                        if self._is_transient_error(gemini_error_str):
                            transient_attempts += 1
                            wait_time = 2 ** transient_attempts  # exponential backoff
                            if transient_attempts < max_transient_attempts:
                                logger.warning(f"Gemini transient error (attempt {transient_attempts}), waiting {wait_time}s before retry...")
                                time.sleep(wait_time)
                            else:
                                logger.error(f"Gemini failed after {max_transient_attempts} transient error retries")
                                raise
                        else:
                            raise
            else:
                raise

    def generate_json(self, prompt: str, expected_keys: list = None) -> dict:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful AI assistant. "
                    "Always respond with valid JSON only. "
                    "Never include markdown, code fences, or explanatory text. "
                    "Your entire response must be parseable by json.loads()."
                )
            },
            {"role": "user", "content": prompt}
        ]

        for attempt in range(1, self.MAX_RETRIES + 1):
            print(f"[LLMService] Attempt {attempt}/{self.MAX_RETRIES}...")
            response = None
            try:
                response = self._call_llm(messages)
            except Exception as exc:
                error_str = str(exc)
                if self._is_auth_error(error_str):
                    logger.warning("Groq auth failed in generate_json(); falling back to Gemini.")
                    transient_attempts = 0
                    max_transient_attempts = 3
                    
                    while transient_attempts < max_transient_attempts:
                        try:
                            response = self._call_gemini(messages)
                            break
                        except Exception as gemini_exc:
                            gemini_error_str = str(gemini_exc)
                            if self._is_transient_error(gemini_error_str):
                                transient_attempts += 1
                                wait_time = 2 ** transient_attempts  # exponential backoff: 2, 4, 8 seconds
                                if transient_attempts < max_transient_attempts:
                                    logger.warning(f"Gemini transient error (attempt {transient_attempts}), waiting {wait_time}s before retry...")
                                    time.sleep(wait_time)
                                else:
                                    logger.error(f"Gemini failed after {max_transient_attempts} transient error retries")
                                    raise
                            else:
                                raise
                else:
                    raise
            
            if response is None:
                logger.error("Failed to get response from any LLM provider")
                raise RuntimeError("No response from LLM providers")
                
            is_valid, error = self._validate_json(response, expected_keys)

            if is_valid:
                return json.loads(self._clean_json(response))

            logger.warning(f"[LLMService] Attempt {attempt} failed: {error}")
            if attempt < self.MAX_RETRIES:
                messages.append({"role": "assistant", "content": response})
                messages.append({
                    "role": "user",
                    "content": (
                        f"Your previous response had an error: {error}\n\n"
                        "Please fix it and return ONLY valid JSON. "
                        "No explanations, no markdown, just the corrected JSON object."
                    )
                })

        raise RuntimeError(
            f"[LLMService] Failed to get valid JSON after {self.MAX_RETRIES} attempts. "
            f"Last error: {error}"
        )
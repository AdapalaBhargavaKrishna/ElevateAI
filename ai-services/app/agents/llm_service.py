import os
import json
import logging
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


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

    def _call_llm(self, messages: list) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.1,
            max_tokens=2048,
        )
        return response.choices[0].message.content

    def _clean_json(self, text: str) -> str:
        return re.sub(r'```json|```', '', text).strip()

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
        return self._call_llm(messages)

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
            response = self._call_llm(messages)
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
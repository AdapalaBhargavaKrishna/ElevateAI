import json
import re
import time
import google.generativeai as genai
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.config import settings
from app.utils.prompts import (
    get_question_generation_prompt,
    get_evaluation_prompt,
    get_followup_prompt,
    get_roadmap_prompt,
)

# ✅ Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(settings.LLM_MODEL)


# =========================
# 🔧 HELPERS
# =========================
def _clean_json_response(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    return raw.strip()


def _parse_json_safe(raw: str) -> Dict[str, Any]:
    cleaned = _clean_json_response(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM returned invalid JSON: {str(e)}"
        )


def _extract_retry_delay_seconds(error_text: str, default_seconds: float = 2.0) -> float:
    # Gemini messages often include either "retry in 15.2s" or "retry_delay { seconds: 15 }".
    inline_match = re.search(r"retry\s+in\s+([0-9]+(?:\.[0-9]+)?)s", error_text, re.IGNORECASE)
    if inline_match:
        return max(float(inline_match.group(1)), 0.5)

    block_match = re.search(r"retry_delay\s*\{[^}]*seconds:\s*(\d+)", error_text, re.IGNORECASE | re.DOTALL)
    if block_match:
        return max(float(block_match.group(1)), 0.5)

    return default_seconds


def _is_rate_limit_error(error_text: str) -> bool:
    lowered = error_text.lower()
    return "429" in lowered or "quota exceeded" in lowered or "rate limit" in lowered


def _generate_content_with_retry(prompt: str, max_attempts: int = 3):
    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            return model.generate_content(prompt)
        except Exception as e:
            last_error = str(e)

            if not _is_rate_limit_error(last_error):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"AI service error: {last_error}"
                )

            if attempt >= max_attempts:
                retry_after = _extract_retry_delay_seconds(last_error)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=(
                        f"AI rate limit exceeded. Please retry in about {int(round(retry_after))} seconds "
                        "or upgrade your Gemini quota."
                    )
                )

            wait_for = _extract_retry_delay_seconds(last_error)
            time.sleep(wait_for)

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"AI service error: {last_error or 'Unknown Gemini error'}"
    )


# =========================
# 🧠 QUESTION GENERATION
# =========================
def generate_questions(
    role: str,
    level: str,
    interview_type: str,
    difficulty: str,
    count: int,
    weak_topics: list = None,
    strong_topics: list = None,
    mode: str = "interview"
) -> List[Dict[str, str]]:

    prompt = get_question_generation_prompt(
        role, level, interview_type, difficulty, count, mode
    )

    if weak_topics:
        prompt += f"""
PRIORITIZE weak topics: {weak_topics}
"""

    if strong_topics:
        prompt += f"""
AVOID strong topics: {strong_topics}
"""

    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)

    questions = data.get("questions", [])

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no questions"
        )

    for q in questions:
        q["hint_level_1"] = q.get("hint_level_1", "")
        q["hint_level_2"] = q.get("hint_level_2", "")

    return questions[:count]


# =========================
# 🧠 ANSWER EVALUATION
# =========================
def evaluate_answer(
    question_text: str,
    user_answer: str,
    role: str,
    level: str,
    interview_type: str,
    mode: str = "interview"
) -> Dict[str, Any]:

    prompt = get_evaluation_prompt(
        question_text, user_answer, role, level, interview_type
    )

    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)

    required_fields = [
        "technical_score", "depth_score", "clarity_score",
        "relevance_score", "structure_score",
        "strengths", "weaknesses", "improvement_suggestions"
    ]

    for field in required_fields:
        if field not in data:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Missing field: {field}"
            )

    # clamp scores
    for f in [
        "technical_score", "depth_score", "clarity_score",
        "relevance_score", "structure_score"
    ]:
        data[f] = max(0.0, min(10.0, float(data[f])))

    data["explanation"] = data.get("explanation", "")
    data["teaching_note"] = data.get("teaching_note", "")

    return data


# =========================
# 🧠 SUMMARY GENERATION (NEW)
# =========================
def generate_summary(text: str) -> Dict[str, Any]:
    prompt = f"""
You are an AI interview evaluator.

Analyze the following interview:

{text}

Return STRICT JSON in this format:

{{
  "overall_summary": "...",
  "strengths": "...",
  "weaknesses": "...",
  "final_score": 0-10,
  "verdict": "Hire / No Hire / Strong Hire / Borderline"
}}

IMPORTANT:
- Return ONLY JSON
- No explanations
- No markdown
"""

    response = _generate_content_with_retry(prompt)
    raw = response.text.strip()

    print("RAW GEMINI RESPONSE:", raw)

    return _parse_json_safe(raw)

# =========================
# 🧠 FOLLOW-UP (optional)
# =========================
def generate_followup_question(
    original_question: str,
    user_answer: str,
    weaknesses: str,
    role: str,
    level: str,
    mode: str = "interview"
) -> Dict[str, str]:

    prompt = get_followup_prompt(
        original_question, user_answer, weaknesses, role, level, mode
    )

    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)

    if "question_text" not in data:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Malformed follow-up question"
        )

    return data


# =========================
# 🧠 ROADMAP (optional)
# =========================
def generate_roadmap(
    target_role: str,
    experience_level: str,
    current_skills: list
) -> dict:

    prompt = get_roadmap_prompt(target_role, current_skills, experience_level)

    response = _generate_content_with_retry(prompt)
    return _parse_json_safe(response.text)
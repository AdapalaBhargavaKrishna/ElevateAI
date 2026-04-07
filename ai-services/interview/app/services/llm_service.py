import json
import re
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

    try:
        response = model.generate_content(prompt)
        data = _parse_json_safe(response.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )

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

    try:
        response = model.generate_content(prompt)
        data = _parse_json_safe(response.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )

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

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        print("🔍 RAW GEMINI RESPONSE:", raw)  # 👈 DEBUG

        return _parse_json_safe(raw)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {str(e)}"
        )

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

    try:
        response = model.generate_content(prompt)
        data = _parse_json_safe(response.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )

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

    try:
        response = model.generate_content(prompt)
        return _parse_json_safe(response.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )
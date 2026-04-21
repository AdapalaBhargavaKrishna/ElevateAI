import json
import re
import time
from google import genai
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.config import settings
from app.utils.prompts import (
    get_question_generation_prompt,
    get_evaluation_prompt,
    get_followup_prompt,
    get_roadmap_prompt,
    get_assessment_prompt,
    get_assessments_batch_prompt,
)

# ✅ Configure Gemini with the new SDK
client = genai.Client(api_key=settings.GEMINI_API_KEY)


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
            return client.models.generate_content(
                model=settings.LLM_MODEL,
                contents=prompt
            )
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
        prompt += f"\nPRIORITIZE weak topics: {weak_topics}\n"

    if strong_topics:
        prompt += f"\nAVOID strong topics: {strong_topics}\n"

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

    for f in [
        "technical_score", "depth_score", "clarity_score",
        "relevance_score", "structure_score"
    ]:
        data[f] = max(0.0, min(10.0, float(data[f])))

    data["explanation"] = data.get("explanation", "")
    data["teaching_note"] = data.get("teaching_note", "")

    return data


# =========================
# 🧠 SUMMARY GENERATION
# =========================
def generate_summary(text: str) -> Dict[str, Any]:
    prompt = f"""You are an AI interview evaluator.

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
    return _parse_json_safe(response.text.strip())


# =========================
# 🧠 FOLLOW-UP
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
# 🗺️ ROADMAP
# =========================
def generate_roadmap(
    target_role: str,
    experience_level: str,
    current_skills: list
) -> dict:

    prompt = get_roadmap_prompt(target_role, current_skills, experience_level)

    response = _generate_content_with_retry(prompt)
    return _parse_json_safe(response.text)


# =========================
# 📝 ASSESSMENTS (NEW)
# =========================
def generate_assessments(
    target_role: str,
    phase_number: int,
    phase_title: str,
    skills_to_learn: list,
    goals: list,
    question_count: int = 10,
) -> dict:
    """Generate MCQ questions for a single roadmap phase."""

    prompt = get_assessment_prompt(
        target_role=target_role,
        phase_number=phase_number,
        phase_title=phase_title,
        skills_to_learn=skills_to_learn,
        goals=goals,
        question_count=question_count,
    )

    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)

    questions = data.get("questions", [])
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no assessment questions"
        )

    # Validate structure
    for q in questions:
        if "question" not in q or "options" not in q or "correct" not in q:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI returned malformed MCQ question"
            )
        q["explanation"] = q.get("explanation", "")

    return {"questions": questions[:question_count]}


def generate_assessments_batch(
    target_role: str,
    phases: list,
    questions_per_phase: int = 10,
) -> dict:
    """Generate MCQ questions for all roadmap phases in one AI call."""

    prompt = get_assessments_batch_prompt(
        target_role=target_role,
        phases=phases,
        questions_per_phase=questions_per_phase,
    )

    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)

    assessments = data.get("assessments", [])
    if not assessments:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no assessments"
        )

    phase_by_number = {int(p.get("phase_number")): p for p in phases}
    validated = []

    for assessment in assessments:
        phase_number = int(assessment.get("phase_number", 0))
        if phase_number not in phase_by_number:
            continue

        expected_title = phase_by_number[phase_number].get("phase_title", "")
        questions = assessment.get("questions", [])

        if not isinstance(questions, list) or len(questions) == 0:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI returned malformed questions for phase {phase_number}"
            )

        normalized_questions = []
        for q in questions[:questions_per_phase]:
            if "question" not in q or "options" not in q or "correct" not in q:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI returned malformed MCQ question in phase {phase_number}"
                )

            options = q.get("options", [])
            if not isinstance(options, list) or len(options) != 4:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI returned invalid options for phase {phase_number}"
                )

            correct = int(q.get("correct", -1))
            if correct < 0 or correct > 3:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI returned invalid correct answer index for phase {phase_number}"
                )

            normalized_questions.append(
                {
                    "question": str(q.get("question", "")).strip(),
                    "options": [str(opt) for opt in options],
                    "correct": correct,
                    "explanation": str(q.get("explanation", "")).strip(),
                }
            )

        if len(normalized_questions) < questions_per_phase:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI returned fewer than {questions_per_phase} questions for phase {phase_number}"
            )

        validated.append(
            {
                "phase_number": phase_number,
                "phase_title": expected_title,
                "questions": normalized_questions,
            }
        )

    if len(validated) != len(phases):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI response did not include all roadmap phases"
        )

    validated.sort(key=lambda x: x["phase_number"])
    return {"assessments": validated}
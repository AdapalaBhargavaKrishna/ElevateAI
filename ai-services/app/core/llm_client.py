import os
import json
import logging
import re
import time
from groq import Groq
from dotenv import load_dotenv
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
    get_dsa_question_prompt,
    get_dsa_evaluation_prompt,
)

load_dotenv()

logger = logging.getLogger(__name__)

_gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Module-level Gemini client used by standalone functions
client = genai.Client(api_key=settings.GEMINI_API_KEY)


# ═══════════════════════════════════════════════════════════════════════
# PART A — LLMService class (Groq primary, Gemini fallback)
# ═══════════════════════════════════════════════════════════════════════

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

    def stream_chat(self, messages: list, system: str):
        """Yields SSE: 'data: <token>\n\n', ends with 'data: [DONE]\n\n'"""
        full_messages = [{"role": "system", "content": system}, *messages]
        try:
            stream = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=full_messages,
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield f"data: {delta}\n\n"
        except Exception as exc:
            if self._is_auth_error(str(exc)):
                try:
                    response = self._call_gemini(full_messages)
                    for word in response.split(" "):
                        yield f"data: {word} \n\n"
                except Exception:
                    yield "data: Sorry, I'm having trouble connecting right now.\n\n"
            else:
                yield "data: Sorry, something went wrong. Please try again.\n\n"
        finally:
            yield "data: [DONE]\n\n"


# ═══════════════════════════════════════════════════════════════════════
# PART B — Standalone Gemini functions
# ═══════════════════════════════════════════════════════════════════════

# =========================
# 🔧 HELPERS
# =========================
def _clean_json_response(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    raw = raw.strip()
    # If the response has text before the first {, strip it
    first_brace = raw.find('{')
    if first_brace > 0:
        raw = raw[first_brace:]
    return raw.strip()


def _parse_json_safe(raw: str) -> Dict[str, Any]:
    cleaned = _clean_json_response(raw)
    # First try normal parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # If "Extra data" error, use raw_decode to get just the first JSON object
    try:
        decoder = json.JSONDecoder()
        obj, _ = decoder.raw_decode(cleaned)
        if isinstance(obj, dict):
            return obj
    except json.JSONDecodeError:
        pass

    # Last resort: find the last } and try parsing up to it
    try:
        depth = 0
        end_idx = -1
        for i, ch in enumerate(cleaned):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break
        if end_idx > 0:
            return json.loads(cleaned[:end_idx + 1])
    except json.JSONDecodeError:
        pass

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"LLM returned invalid JSON that could not be parsed"
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
            print(f"[LLM] Attempt {attempt}/{max_attempts} — calling {settings.LLM_MODEL}...")
            import time as _t
            _start = _t.time()
            result = client.models.generate_content(
                model=settings.LLM_MODEL,
                contents=prompt
            )
            elapsed = _t.time() - _start
            print(f"[LLM] Success in {elapsed:.1f}s (attempt {attempt})")
            return result
        except Exception as e:
            last_error = str(e)
            print(f"[LLM] Attempt {attempt} failed: {last_error[:200]}")

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
            print(f"[LLM] Rate limited — waiting {wait_for:.1f}s before retry...")
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
  "final_score": 0-100,
  "verdict": "Hire / No Hire / Strong Hire / Borderline"
}}

IMPORTANT:
- Return ONLY JSON
- No explanations
- No markdown
- final_score: integer 0-100 representing overall session performance
- final_score must be 0-100 integer (not 0-10).
"""

    response = _generate_content_with_retry(prompt)
    summary = _parse_json_safe(response.text.strip())
    summary["final_score"] = min(max(int(summary.get("final_score", 0)), 0), 100)
    return summary


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


def generate_dsa_questions(count: int, difficulty: str, topic: str) -> List[Dict[str, Any]]:
    prompt = get_dsa_question_prompt(count=count, difficulty=difficulty, topic=topic)
    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)
    questions = data.get("questions", [])
    if not isinstance(questions, list) or len(questions) == 0:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned no DSA questions"
        )
    return questions[:count]


def evaluate_dsa_solution(
    problem_description: str,
    user_code: str,
    language: str,
    test_results: Any
) -> Dict[str, Any]:
    prompt = get_dsa_evaluation_prompt(
        problem_description=problem_description,
        user_code=user_code,
        language=language,
        test_results=json.dumps(test_results)
    )
    response = _generate_content_with_retry(prompt)
    data = _parse_json_safe(response.text)
    return data


def generate_dsa_summary(questions: list, codes: list, evaluations: list) -> Dict[str, Any]:
    payload = []
    for idx, question in enumerate(questions):
        payload.append(
            {
                "question": question,
                "code": codes[idx] if idx < len(codes) else "",
                "evaluation": evaluations[idx] if idx < len(evaluations) else {},
            }
        )

    prompt = f"""You are an expert DSA interviewer.
Analyze all submitted coding problems and evaluations below and return final interview summary.

Submissions:
{json.dumps(payload)}

Return ONLY valid JSON with:
{{
  "overall_summary": "string",
  "strengths": "string",
  "weaknesses": "string",
  "final_score": 0,
  "verdict": "Strong Hire|Hire|Borderline|No Hire"
}}

Rules:
- final_score must be 0-100 integer.
- Be concise and evidence-based.
"""
    response = _generate_content_with_retry(prompt)
    return _parse_json_safe(response.text)

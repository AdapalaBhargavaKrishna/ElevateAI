from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enum import Enum


# =========================
# ✅ ENUMS (NO DB)
# =========================

class ExperienceLevel(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class InterviewType(str, Enum):
    technical = "technical"
    behavioral = "behavioral"


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


# =========================
# 🚀 START INTERVIEW
# =========================

class InterviewStartRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=255)
    level: ExperienceLevel
    interview_type: InterviewType
    difficulty: Difficulty
    question_count: int = Field(..., ge=1, le=15)
    timer_enabled: bool = False
    time_per_question: Optional[int] = Field(None, ge=30, le=300)
    mode: Optional[str] = "interview"

    @field_validator("time_per_question")
    def validate_timer(cls, v, info):
        values = info.data
        if values.get("timer_enabled") and v is None:
            raise ValueError("time_per_question required when timer_enabled=True")
        return v


class QuestionOut(BaseModel):
    question_text: str
    category: Optional[str] = None
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None


class InterviewStartResponse(BaseModel):
    session_id: str
    first_question: QuestionOut
    total_questions: int


# =========================
# 🧠 ANSWER EVALUATION
# =========================

class AnswerSubmitRequest(BaseModel):
    question: str
    answer: str = Field(..., min_length=1, max_length=5000)
    role: str
    level: str


class EvaluationResult(BaseModel):
    technical_score: float
    depth_score: float
    clarity_score: float
    relevance_score: float
    structure_score: float
    overall_score: float
    explanation: Optional[str] = None
    teaching_note: Optional[str] = None
    strengths: str
    weaknesses: str
    improvement_suggestions: str


class AnswerSubmitResponse(BaseModel):
    evaluation: EvaluationResult
    next_question: Optional[QuestionOut] = None
    is_last_question: bool = False
    questions_answered: int = 0
    total_questions: int = 0


# =========================
# 📊 SUMMARY
# =========================

class SummaryRequest(BaseModel):
    questions: List[str]
    answers: List[str]


class SessionSummaryResponse(BaseModel):
    overall_summary: str
    strengths: str
    weaknesses: str
    final_score: float
    verdict: str
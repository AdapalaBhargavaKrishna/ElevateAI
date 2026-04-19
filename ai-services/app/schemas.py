from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
from enum import Enum


# =========================
# ✅ ENUMS
# =========================

class ExperienceLevel(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class InterviewType(str, Enum):
    technical = "technical"
    behavioral = "behavioral"
    system_design = "system_design"
    hr = "hr"


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
    interview_type: str = Field(..., min_length=1, max_length=100)
    difficulty: Difficulty
    question_count: int = Field(..., ge=1, le=15)
    timer_enabled: bool = False
    time_per_question: Optional[int] = Field(None, ge=30, le=300)
    mode: Optional[str] = "interview"

    @field_validator("interview_type")
    def normalize_interview_type(cls, value: str) -> str:
        normalized = value.strip().lower().replace("-", "_").replace(" ", "_")
        aliases = {
            "behavioural": "behavioral",
            "systemdesign": "system_design",
            "system-design": "system_design",
        }
        return aliases.get(normalized, normalized)

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
    questions: List[QuestionOut]


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


# =========================
# 🗺️ ROADMAP
# =========================

class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., min_length=1, max_length=255)
    experience_level: str
    current_skills: Optional[List[str]] = []


class RoadmapPhaseResource(BaseModel):
    type: str
    title: str
    url: str = ""
    is_free: bool = True


class RoadmapPhaseProject(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []


class RoadmapPhase(BaseModel):
    phase_number: int
    title: str
    duration: str
    goals: List[str]
    skills_to_learn: List[str]
    resources: List[RoadmapPhaseResource] = []
    projects: List[RoadmapPhaseProject] = []


class SkillGap(BaseModel):
    skill: str
    priority: str
    reason: str


class Certification(BaseModel):
    name: str
    provider: str
    priority: str
    is_free: bool = False


class IndustryInsights(BaseModel):
    demand_level: str
    avg_salary_range: str
    top_companies_hiring: List[str]
    key_technologies: List[str]


class RoadmapGenerateResponse(BaseModel):
    target_role: str
    summary: str
    estimated_timeline: str
    skill_gaps: List[SkillGap] = []
    phases: List[RoadmapPhase]
    certifications: List[Certification] = []
    industry_insights: IndustryInsights


# =========================
# 📝 ASSESSMENTS
# =========================

class AssessmentsGenerateRequest(BaseModel):
    target_role: str
    phase_number: int
    phase_title: str
    skills_to_learn: List[str]
    goals: List[str]


class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int
    explanation: str


class AssessmentsGenerateResponse(BaseModel):
    questions: List[MCQQuestion]
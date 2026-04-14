from fastapi import APIRouter, Header, HTTPException
from app import schemas
from app.services import interview_service
from app.config import settings

router = APIRouter(prefix="/interview", tags=["Interview"])


# ✅ START INTERVIEW (AI generates questions)
@router.post("/start", response_model=schemas.InterviewStartResponse)
def start_interview(
    request: schemas.InterviewStartRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    # 🔐 Internal security
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = interview_service.generate_questions(
        role=request.role,
        level=request.level,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        question_count=request.question_count
    )

    return schemas.InterviewStartResponse(
        session_id="temp-session-id",  # Node will manage real session
        first_question=result["questions"][0],
        total_questions=len(result["questions"]),
        questions=result["questions"]
    )


# ✅ SUBMIT ANSWER (AI evaluates)
@router.post("/answer", response_model=schemas.AnswerSubmitResponse)
def submit_answer(
    request: schemas.AnswerSubmitRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    evaluation = interview_service.evaluate_answer(
        question=request.question,
        answer=request.answer,
        role=request.role,
        level=request.level
    )

    return schemas.AnswerSubmitResponse(
        evaluation=schemas.EvaluationResult(**evaluation),
        next_question=None,  # Node controls flow
        is_last_question=False,
        questions_answered=0,
        total_questions=0
    )


# ✅ SUMMARY (AI-based — KEEP but refactor)
@router.post("/summary", response_model=schemas.SessionSummaryResponse)
def get_summary(
    request: schemas.SummaryRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    summary = interview_service.generate_summary(
        questions=request.questions,
        answers=request.answers
    )

    return schemas.SessionSummaryResponse(**summary)


# ✅ HEALTH CHECK
@router.get("/ping")
def ping():
    return {"message": "Interview AI running"}
from fastapi import APIRouter, Header, HTTPException
from app import schemas
from app.graphs import interview_graph
from app.config import settings

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start", response_model=schemas.InterviewStartResponse)
def start_interview(
    request: schemas.InterviewStartRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    # 🔐 Internal security
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    questions = interview_graph.generate_questions(
        role=request.role,
        level=request.level,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        count=request.question_count,
        mode=request.mode or "interview",
    )

    return schemas.InterviewStartResponse(
        session_id="temp-session-id",
        first_question=questions[0],
        total_questions=len(questions),
        questions=questions
    )

@router.post("/answer", response_model=schemas.AnswerSubmitResponse)
def submit_answer(
    request: schemas.AnswerSubmitRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    evaluation = interview_graph.evaluate(
        question_text=request.question,
        user_answer=request.answer,
        role=request.role,
        level=request.level,
        interview_type=request.interview_type,
        mode=request.mode,
    )

    follow_up = evaluation.pop("follow_up_question", None)

    return schemas.AnswerSubmitResponse(
        evaluation=schemas.EvaluationResult(**evaluation),
        next_question=None,  # Node controls flow
        follow_up_question=schemas.QuestionOut(**follow_up) if follow_up else None,
        is_last_question=False,
        questions_answered=0,
        total_questions=0
    )

@router.post("/summary", response_model=schemas.SessionSummaryResponse)
def get_summary(
    request: schemas.SummaryRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    summary = interview_graph.generate_summary(
        questions=request.questions,
        answers=request.answers,
    )

    return schemas.SessionSummaryResponse(**summary)

@router.get("/ping")
def ping():
    return {"message": "Interview AI running"}

@router.post("/dsa-start", response_model=schemas.DSAStartResponse)
def dsa_start(
    request: schemas.DSAStartRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    topic = f"{request.role} {request.level}"
    questions = interview_graph.generate_dsa_questions(
        count=request.question_count,
        difficulty=request.difficulty,
        topic=topic,
    )
    return schemas.DSAStartResponse(questions=questions)

@router.post("/dsa-evaluate", response_model=schemas.DSAEvaluationResponse)
def dsa_evaluate(
    request: schemas.DSAEvaluationRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        evaluation = interview_graph.evaluate_dsa_solution(
            problem_description=request.problem_description,
            user_code=request.user_code,
            language=request.language,
            test_results=request.test_results,
        )
        return schemas.DSAEvaluationResponse(**evaluation)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"AI evaluation failed: {str(e)}")

@router.post("/dsa-summary", response_model=schemas.SessionSummaryResponse)
def dsa_summary(
    request: schemas.DSASummaryRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key")
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    summary = interview_graph.generate_dsa_summary(
        questions=request.questions,
        codes=request.codes,
        evaluations=request.evaluations,
    )
    return schemas.SessionSummaryResponse(**summary)
from fastapi import APIRouter, Header, HTTPException
from app import schemas
from app.agents.roadmap.orchestrator import RoadmapOrchestrator
from app.config import settings
import traceback

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

roadmap_orchestrator = RoadmapOrchestrator()


def _check_internal_key(x_internal_key: str):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")


# ─── POST /roadmap/generate ───────────────────────────────────────────────────
@router.post("/generate", response_model=schemas.RoadmapGenerateResponse)
def generate_roadmap(
    request: schemas.RoadmapGenerateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    _check_internal_key(x_internal_key)
    print(f"[Roadmap AI] generate_roadmap called: role={request.target_role}, level={request.experience_level}, user={x_user_id}")

    try:
        roadmap_data = roadmap_orchestrator.generate_roadmap(
            target_role=request.target_role,
            experience_level=request.experience_level,
            current_skills=request.current_skills or [],
        )
        print(f"[Roadmap AI] generate_roadmap success: {len(roadmap_data.get('phases', []))} phases")
        return roadmap_data
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"Roadmap generation failed: {str(e)}")


# ─── POST /roadmap/assessments/generate ──────────────────────────────────────
@router.post("/assessments/generate", response_model=schemas.AssessmentsGenerateResponse)
def generate_assessments(
    request: schemas.AssessmentsGenerateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    _check_internal_key(x_internal_key)

    try:
        result = roadmap_orchestrator.generate_assessments(
            target_role=request.target_role,
            phase_number=request.phase_number,
            phase_title=request.phase_title,
            skills_to_learn=request.skills_to_learn,
            goals=request.goals,
            question_count=request.question_count,
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"Assessment generation failed: {str(e)}")


# ─── POST /roadmap/assessments/bulk-generate ─────────────────────────────────
@router.post("/assessments/bulk-generate", response_model=schemas.AssessmentsBatchGenerateResponse)
def generate_assessments_batch(
    request: schemas.AssessmentsBatchGenerateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    _check_internal_key(x_internal_key)
    print(f"[Roadmap AI] bulk-generate called: {len(request.phases)} phases, {request.questions_per_phase} questions each")

    try:
        result = roadmap_orchestrator.generate_assessments_batch(
            target_role=request.target_role,
            phases=[
                {
                    "phase_number": p.phase_number,
                    "phase_title": p.phase_title,
                    "skills_to_learn": p.skills_to_learn,
                    "goals": p.goals,
                }
                for p in request.phases
            ],
            questions_per_phase=request.questions_per_phase,
        )
        print(f"[Roadmap AI] bulk-generate success: {len(result.get('assessments', []))} assessments returned")
        return result
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"Batch assessment generation failed: {str(e)}")
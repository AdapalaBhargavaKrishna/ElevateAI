from fastapi import APIRouter, Header, HTTPException
from app import schemas
from app.services import llm_service
from app.config import settings

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


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

    roadmap_data = llm_service.generate_roadmap(
        target_role=request.target_role,
        experience_level=request.experience_level,
        current_skills=request.current_skills or [],
    )

    return roadmap_data


# ─── POST /roadmap/assessments/generate ──────────────────────────────────────
@router.post("/assessments/generate", response_model=schemas.AssessmentsGenerateResponse)
def generate_assessments(
    request: schemas.AssessmentsGenerateRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    _check_internal_key(x_internal_key)

    result = llm_service.generate_assessments(
        target_role=request.target_role,
        phase_number=request.phase_number,
        phase_title=request.phase_title,
        skills_to_learn=request.skills_to_learn,
        goals=request.goals,
    )

    return result
from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.config import settings
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resume", tags=["Resume"])

# One shared instance
resume_service = ResumeService()


class ResumeTextRequest(BaseModel):
    resume_text: str


def _check_auth(key: str):
    if key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/analyze-file")
async def analyze_resume_file(
    file: UploadFile = File(...),
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Called by Node api-services only — NOT the frontend directly.
    Accepts PDF or DOCX. Returns full AI analysis. No DB here.
    """
    _check_auth(x_internal_key)

    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in {"pdf", "docx"}:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Upload PDF or DOCX."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = resume_service.analyze(file_bytes=file_bytes, filename=filename)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-text")
def analyze_resume_text(
    request: ResumeTextRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    """
    Called by Node api-services only.
    Accepts plain text. Returns full AI analysis. No DB here.
    """
    _check_auth(x_internal_key)

    try:
        result = resume_service.analyze(resume_text=request.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ping")
def ping():
    return {"message": "Resume AI running"}
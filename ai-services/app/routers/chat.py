from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.config import settings
from app.agents.llm_service import LLMService

router = APIRouter(prefix="/chat", tags=["Chat"])
llm = LLMService()


class ChatMessage(BaseModel):
    role: str
    content: str


class UserContext(BaseModel):
    fullName: str
    careerGoal: str = ""
    skills: list[str] = []
    avgInterviewScore: int = 0
    roadmapProgress: int = 0


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    userContext: UserContext


@router.post("/stream")
def chat_stream(
    request: ChatRequest,
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_internal_key: str = Header(..., alias="X-Internal-Key"),
):
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    ctx = request.userContext
    system = f"""You are an expert AI Career Assistant for ElevateAI.
You are helping {ctx.fullName}, targeting the role: {ctx.careerGoal or 'not specified'}.
Current skills: {', '.join(ctx.skills) or 'not specified'}.
Avg interview score: {ctx.avgInterviewScore}%.
Roadmap completion: {ctx.roadmapProgress}%.
Be specific, actionable, encouraging, and concise."""

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    return StreamingResponse(
        llm.stream_chat(messages=messages, system=system),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

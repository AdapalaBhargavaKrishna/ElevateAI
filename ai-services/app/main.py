from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import interview
from app.routers import resume

app = FastAPI(
    title="ElevateAI AI Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Interview routes (/interview/start, /interview/answer, /interview/summary)
app.include_router(interview.router, tags=["Interview"])

# Resume routes (/resume/analyze-file, /resume/analyze-text)
app.include_router(resume.router, tags=["Resume"])


@app.get("/health")
def health():
    return {"status": "ok"}
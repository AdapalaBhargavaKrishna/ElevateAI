from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import interview

app = FastAPI(
    title="ElevateAI Interview Engine",
    version="1.0.0"
)

# ✅ Use config-based CORS (clean)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Add prefix for cleaner API structure
app.include_router(interview.router, tags=["Interview"])

# ✅ Health check (very important for deployment)
@app.get("/health")
def health():
    return {"status": "ok"}
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Interview AI (Gemini)
    GEMINI_API_KEY: str
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_MAX_TOKENS: int = 2000

    # Resume AI (Groq)
    GROQ_API_KEY: str

    hf_api_key: str

    # Security between Node ↔ FastAPI
    INTERNAL_API_KEY: str

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
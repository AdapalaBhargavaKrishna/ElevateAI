from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ✅ AI related
    GEMINI_API_KEY: str
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_MAX_TOKENS: int = 2000

    # ✅ Security between Node ↔ FastAPI
    INTERNAL_API_KEY: str

    # ✅ CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
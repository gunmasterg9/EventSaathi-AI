import os
from typing import List, Literal
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "EventSaathi AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    
    # Database
    DATABASE_URL: str = "sqlite:///./eventsaathi.db"
    
    # AI Provider configuration (Google Gemini)
    AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    AI_TIMEOUT_SECONDS: int = 25
    AI_MAX_RETRIES: int = 1
    
    # Limits & Security
    MAX_REQUEST_SIZE_BYTES: int = 2 * 1024 * 1024  # 2MB
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_ai_credentials(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip() and self.GEMINI_API_KEY != "your_gemini_api_key_here")

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()

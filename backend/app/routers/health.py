from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.config import settings

router = APIRouter(prefix="/api", tags=["Health & Status"])

@router.get("/health")
def get_health_status(db: Session = Depends(get_db)):
    """
    Health check endpoint returning system status, database connectivity,
    and AI provider status.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    has_ai = settings.has_ai_credentials
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "ai_engine": {
            "has_credentials": has_ai,
            "provider": "google_gemini" if has_ai else "deterministic_rules_engine",
            "model": settings.GEMINI_MODEL,
            "fallback_ready": True
        }
    }

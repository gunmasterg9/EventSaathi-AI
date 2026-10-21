from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import health, events, budget, tasks, vendors

# Configure application logging (safe, no secrets logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("eventsaathi")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables if not present
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down EventSaathi AI...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="GenAI-powered Celebration & Event Planner (Weddings, Birthdays, Community Events)",
    lifespan=lifespan,
)

# Request size limiting middleware (Security Requirement 14)
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.MAX_REQUEST_SIZE_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request payload exceeds maximum allowed size (2MB)."}
            )
        return await call_next(request)

app.add_middleware(RequestSizeLimitMiddleware)

# CORS middleware with strict origin whitelist
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global safe error handler (prevents trace leakage)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {type(exc).__name__}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include API Routers
app.include_router(health.router)
app.include_router(events.router)
app.include_router(budget.router)
app.include_router(tasks.router)
app.include_router(vendors.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to EventSaathi AI API",
        "docs_url": "/docs",
        "version": settings.APP_VERSION,
        "health": "/api/health"
    }

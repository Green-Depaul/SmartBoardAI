# Health Routes for SmartBoardAI
# Handles health check endpoints

from fastapi import APIRouter
from app.models import HealthResponse
from app.services.java_client import ping
from app.logging_config import api_logger

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("/", response_model=HealthResponse)
async def health():
    """Health check endpoint with Java service status"""
    api_logger.info("Health check requested")
    java_ok = await ping()
    api_logger.info(f"Health check completed - Java service: {'OK' if java_ok else 'FAILED'}")
    return HealthResponse(status="ok", java_ok=java_ok)


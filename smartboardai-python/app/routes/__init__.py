# Routes module for SmartBoardAI
# Centralized route registration

from fastapi import FastAPI
from app.routes import ai, projects, health

def register_routes(app: FastAPI):
    """Register all route modules with the FastAPI app"""
    app.include_router(ai.router)
    app.include_router(projects.router)
    app.include_router(health.router)

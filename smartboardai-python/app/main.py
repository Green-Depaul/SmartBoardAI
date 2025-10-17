from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.logging_config import setup_logging
from app.routes import register_routes

# Initialize logging
setup_logging()

app = FastAPI(title="SmartBoardAI Python Middleware", version="0.2.0")

# CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_origins == ["*"] else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
register_routes(app)
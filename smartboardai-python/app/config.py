import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    app_host: str = os.getenv("APP_HOST", "0.0.0.0")
    # Default Python middleware to 8081 to avoid clashing with Java backend on 8080
    app_port: int = int(os.getenv("APP_PORT", "8081"))
    app_env: str = os.getenv("APP_ENV", "dev")
    cors_origins: list[str] = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]

    # Default Java backend base URL to 8080 (Spring Boot)
    java_base_url: str = os.getenv("JAVA_BASE_URL", "http://localhost:8080")
    java_health_path: str = os.getenv("JAVA_HEALTH_PATH", "/api/users/health")
    java_api_key: str = os.getenv("JAVA_API_KEY", "")
    java_auth_bearer: str = os.getenv("JAVA_AUTH_BEARER", "")

    together_api_key: str = os.getenv("TOGETHER_API_KEY", "").strip()
    together_base_url: str = os.getenv("TOGETHER_BASE_URL", "https://api.together.xyz/v1")
    together_model: str = os.getenv("TOGETHER_MODEL", "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo")

settings = Settings()

# Debug logging for API key
if settings.together_api_key:
    print(f"Together API key loaded: {settings.together_api_key[:10]}...")
else:
    print("WARNING: Together API key is empty!")

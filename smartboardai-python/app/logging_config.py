import logging
import sys
from typing import Optional
from app.config import settings

def setup_logging() -> logging.Logger:
    """
    Configure logging for the application.
    Creates separate loggers for different components.
    """
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.app_env == "dev" else logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    
    # File handler (if in production)
    if settings.app_env == "prod":
        file_handler = logging.FileHandler("smartboardai.log")
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        root_logger.addHandler(file_handler)
    
    root_logger.addHandler(console_handler)
    
    return root_logger

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a specific component."""
    return logging.getLogger(f"smartboardai.{name}")

# Component-specific loggers
api_logger = get_logger("api")
java_logger = get_logger("java_client")
together_logger = get_logger("together")
error_logger = get_logger("errors")

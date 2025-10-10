"""
Test Configuration for AI Project Manager Tool
Centralized configuration for all test settings
"""

import os
from typing import Dict, Any

class TestConfig:
    """Centralized test configuration"""
    
    # Server URLs
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Test timeouts (in seconds)
    DEFAULT_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "30"))
    AI_RESPONSE_TIMEOUT = int(os.getenv("AI_RESPONSE_TIMEOUT", "60"))
    BROWSER_TIMEOUT = int(os.getenv("BROWSER_TIMEOUT", "10"))
    
    # Browser settings
    HEADLESS_BROWSER = os.getenv("HEADLESS_BROWSER", "true").lower() == "true"
    BROWSER_WIDTH = int(os.getenv("BROWSER_WIDTH", "1920"))
    BROWSER_HEIGHT = int(os.getenv("BROWSER_HEIGHT", "1080"))
    
    # Test data
    TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL", "test@example.com")
    TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "testpassword")
    TEST_USER_ID = os.getenv("TEST_USER_ID", "test_user_123")
    
    # AI Testing
    AI_TEST_PROMPTS = [
        "Create a project plan for building a mobile app",
        "Generate tasks for a website redesign project",
        "Plan the development of an e-commerce platform",
        "Create a sprint plan for a software development project"
    ]
    
    # Performance thresholds
    MAX_RESPONSE_TIME = float(os.getenv("MAX_RESPONSE_TIME", "5.0"))
    MAX_AI_RESPONSE_TIME = float(os.getenv("MAX_AI_RESPONSE_TIME", "30.0"))
    MAX_PAGE_LOAD_TIME = float(os.getenv("MAX_PAGE_LOAD_TIME", "3.0"))
    
    # Test data generation
    TEST_TASK_TITLES = [
        "Design user interface",
        "Implement authentication",
        "Write unit tests",
        "Deploy to production",
        "Code review",
        "Bug fixes",
        "Performance optimization",
        "Documentation update"
    ]
    
    TEST_TASK_DESCRIPTIONS = [
        "Create wireframes and mockups for the user interface",
        "Implement secure user authentication system",
        "Write comprehensive unit tests for all modules",
        "Deploy application to production environment",
        "Review code for quality and best practices",
        "Fix reported bugs and issues",
        "Optimize application performance",
        "Update project documentation"
    ]
    
    # Error handling test scenarios
    ERROR_SCENARIOS = {
        "network_failure": {
            "invalid_url": "http://invalid-backend-url:9999",
            "timeout": 0.1
        },
        "invalid_requests": {
            "malformed_json": "invalid json string",
            "missing_fields": {},
            "invalid_endpoints": ["/api/invalid", "/api/nonexistent"]
        },
        "ai_failures": {
            "empty_prompts": ["", None],
            "long_prompts": ["x" * 10000],
            "invalid_data": [{"invalid": "data"}]
        }
    }
    
    # Database settings (if applicable)
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "")
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "/Users/mcamac22/Testing_Midterm/test.log")
    
    # Report settings
    REPORT_DIR = "/Users/mcamac22/Testing_Midterm"
    REPORT_FORMATS = ["json", "html", "markdown"]
    
    # Selenium settings
    SELENIUM_SETTINGS = {
        "implicit_wait": 10,
        "explicit_wait": 30,
        "page_load_timeout": 30,
        "script_timeout": 30
    }
    
    # API testing settings
    API_SETTINGS = {
        "retry_attempts": 3,
        "retry_delay": 1,
        "verify_ssl": True,
        "follow_redirects": True
    }
    
    @classmethod
    def get_browser_options(cls) -> Dict[str, Any]:
        """Get browser options for Selenium"""
        return {
            "headless": cls.HEADLESS_BROWSER,
            "window_size": (cls.BROWSER_WIDTH, cls.BROWSER_HEIGHT),
            "disable_gpu": True,
            "no_sandbox": True,
            "disable_dev_shm_usage": True
        }
    
    @classmethod
    def get_test_environment(cls) -> Dict[str, Any]:
        """Get current test environment configuration"""
        return {
            "frontend_url": cls.FRONTEND_URL,
            "backend_url": cls.BACKEND_URL,
            "timeouts": {
                "default": cls.DEFAULT_TIMEOUT,
                "ai_response": cls.AI_RESPONSE_TIMEOUT,
                "browser": cls.BROWSER_TIMEOUT
            },
            "performance": {
                "max_response_time": cls.MAX_RESPONSE_TIME,
                "max_ai_response_time": cls.MAX_AI_RESPONSE_TIME,
                "max_page_load_time": cls.MAX_PAGE_LOAD_TIME
            },
            "browser": cls.get_browser_options(),
            "api": cls.API_SETTINGS
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate test configuration"""
        issues = []
        
        # Check URLs
        if not cls.FRONTEND_URL.startswith(("http://", "https://")):
            issues.append("FRONTEND_URL must start with http:// or https://")
        
        if not cls.BACKEND_URL.startswith(("http://", "https://")):
            issues.append("BACKEND_URL must start with http:// or https://")
        
        # Check timeouts
        if cls.DEFAULT_TIMEOUT <= 0:
            issues.append("DEFAULT_TIMEOUT must be positive")
        
        if cls.AI_RESPONSE_TIMEOUT <= 0:
            issues.append("AI_RESPONSE_TIMEOUT must be positive")
        
        # Check performance thresholds
        if cls.MAX_RESPONSE_TIME <= 0:
            issues.append("MAX_RESPONSE_TIME must be positive")
        
        if issues:
            print("Configuration issues found:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        
        return True

# Environment-specific configurations
class DevelopmentConfig(TestConfig):
    """Development environment configuration"""
    FRONTEND_URL = "http://localhost:3000"
    BACKEND_URL = "http://localhost:8000"
    LOG_LEVEL = "DEBUG"

class StagingConfig(TestConfig):
    """Staging environment configuration"""
    FRONTEND_URL = "https://staging-frontend.example.com"
    BACKEND_URL = "https://staging-api.example.com"
    LOG_LEVEL = "INFO"

class ProductionConfig(TestConfig):
    """Production environment configuration"""
    FRONTEND_URL = "https://app.example.com"
    BACKEND_URL = "https://api.example.com"
    LOG_LEVEL = "WARNING"

def get_config(environment: str = "development") -> TestConfig:
    """Get configuration for specified environment"""
    config_map = {
        "development": DevelopmentConfig,
        "staging": StagingConfig,
        "production": ProductionConfig
    }
    
    config_class = config_map.get(environment.lower(), DevelopmentConfig)
    return config_class()

# Default configuration
config = get_config(os.getenv("TEST_ENV", "development"))

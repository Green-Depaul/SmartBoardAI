# Constants for prompts and AI configuration

class PromptConstants:
    """Constants related to prompts and AI behavior"""
    
    # Default AI parameters
    DEFAULT_TEMPERATURE = 0.2
    DEFAULT_MAX_TOKENS = 512
    DEFAULT_STEPS_TEMPERATURE = 0.1
    DEFAULT_STEPS_MAX_TOKENS = 2048
    DEFAULT_TASKS_TEMPERATURE = 0.1
    DEFAULT_TASKS_MAX_TOKENS = 2048
    
    # Complexity levels
    COMPLEXITY_LOW = "low"
    COMPLEXITY_MEDIUM = "medium"
    COMPLEXITY_HIGH = "high"
    
    # Priority levels
    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"
    
    # JSON response keys
    JSON_KEY_PROJECT_STEPS = "project_steps"
    JSON_KEY_TASKS = "tasks"
    JSON_KEY_TOTAL_DURATION = "total_estimated_duration"
    JSON_KEY_TOTAL_HOURS = "total_estimated_hours"
    JSON_KEY_PROJECT_SUMMARY = "project_summary"
    JSON_KEY_RECOMMENDATIONS = "recommendations"

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uuid

class PromptRequest(BaseModel):
    user_id: str = Field(..., description="ID used by Java to look up user/team/org info")
    project_id: str = Field(..., description="ID used by Java to fetch project context")
    message: str = Field(..., min_length=1, description="Raw user input from the frontend")
    temperature: Optional[float] = 0.2
    max_tokens: Optional[float] = 512

class PromptResponse(BaseModel):
    message_id: str
    output: str
    used_context_keys: List[str] = []
    meta: Dict[str, Any] = {}

class HealthResponse(BaseModel):
    status: str
    java_ok: bool

class ProjectStep(BaseModel):
    step_number: int = Field(..., description="Sequential step number")
    title: str = Field(..., description="Step title/summary")
    description: str = Field(..., description="Detailed step description")
    estimated_duration: Optional[str] = Field(None, description="Estimated time to complete")
    dependencies: List[int] = Field(default=[], description="Step numbers this depends on")
    priority: str = Field(default="medium", description="Priority level: low, medium, high")
    category: Optional[str] = Field(None, description="Step category (e.g., planning, development, testing)")

class GenerateStepsRequest(BaseModel):
    user_id: str = Field(..., description="ID used by Java to look up user/team/org info")
    project_id: str = Field(..., description="ID used by Java to fetch project context")
    project_description: str = Field(..., min_length=10, description="Detailed project description")
    project_type: Optional[str] = Field(None, description="Type of project (e.g., software, marketing, research)")
    timeline: Optional[str] = Field(None, description="Desired timeline or deadline")
    team_size: Optional[int] = Field(None, description="Number of team members")
    complexity: Optional[str] = Field("medium", description="Project complexity: low, medium, high")
    temperature: Optional[float] = 0.1  # Lower temperature for more consistent step generation

class GenerateStepsResponse(BaseModel):
    message_id: str
    project_steps: List[ProjectStep]
    total_estimated_duration: Optional[str] = None
    project_summary: str
    recommendations: List[str] = []
    meta: Dict[str, Any] = {}

# New models for /generate_plan endpoint
class Task(BaseModel):
    """Individual task model compatible with Java backend"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="Task title")
    description: str = Field(..., description="Detailed task description")
    estimated_hours: Optional[int] = Field(None, description="Estimated hours to complete")
    priority: str = Field(default="medium", description="Priority: low, medium, high")
    category: Optional[str] = Field(None, description="Task category")
    dependencies: List[str] = Field(default=[], description="Task IDs this depends on")

class GeneratePlanRequest(BaseModel):
    """Request model for /generate_plan endpoint"""
    prompt: str = Field(..., min_length=1, description="Project description or prompt")
    project_type: Optional[str] = Field(None, description="Type of project")
    complexity: Optional[str] = Field("medium", description="Project complexity: low, medium, high")
    team_size: Optional[int] = Field(None, description="Number of team members")
    timeline: Optional[str] = Field(None, description="Project timeline")
    max_tasks: Optional[int] = Field(10, description="Maximum number of tasks to generate")

class GeneratePlanResponse(BaseModel):
    """Response model for /generate_plan endpoint"""
    success: bool
    tasks: List[Task]
    total_estimated_hours: Optional[int] = None
    project_summary: Optional[str] = None
    recommendations: List[str] = []
    error_message: Optional[str] = None
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
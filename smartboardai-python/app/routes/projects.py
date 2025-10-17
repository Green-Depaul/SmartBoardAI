# Project Routes for SmartBoardAI
# Handles project planning and task generation endpoints

from fastapi import APIRouter, HTTPException
from app.models import GenerateStepsRequest, GenerateStepsResponse, GeneratePlanRequest, GeneratePlanResponse
from app.logging_config import api_logger

router = APIRouter(prefix="/api/projects", tags=["Projects"])

# Import shared service instance
from app.services.project_service import ProjectService
project_service = ProjectService()

@router.post("/generate-steps", response_model=GenerateStepsResponse)
async def generate_project_steps(req: GenerateStepsRequest):
    """Generate detailed project steps from user input with AI assistance"""
    api_logger.info(f"Project steps generation requested - user_id: {req.user_id}, project_id: {req.project_id}")
    
    try:
        result = await project_service.generate_project_steps(
            user_id=req.user_id,
            project_id=req.project_id,
            project_description=req.project_description,
            project_type=req.project_type,
            complexity=req.complexity or "medium",
            timeline=req.timeline,
            team_size=req.team_size,
            temperature=req.temperature or 0.1
        )
        
        api_logger.info(f"Project steps generation completed successfully for user {req.user_id}")
        return GenerateStepsResponse(
            message_id=result["message_id"],
            project_steps=result["project_steps"],
            total_estimated_duration=result["total_estimated_duration"],
            project_summary=result["project_summary"],
            recommendations=result["recommendations"],
            meta=result["meta"]
        )
        
    except ValueError as e:
        api_logger.error(f"Failed to parse AI response: {e}")
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        api_logger.error(f"Unexpected error in generate_project_steps: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/generate_plan", response_model=GeneratePlanResponse)
async def generate_plan(request: GeneratePlanRequest):
    """
    Generate project tasks from a prompt - compatible with Java backend
    
    This endpoint accepts a project description and returns a list of actionable tasks
    that can be used by the Java backend for project planning.
    """
    api_logger.info("Task generation request received")
    
    try:
        result = await project_service.generate_tasks(
            prompt=request.prompt,
            project_type=request.project_type,
            complexity=request.complexity or "medium",
            team_size=request.team_size,
            timeline=request.timeline,
            max_tasks=request.max_tasks or 10
        )
        
        api_logger.info("Task generation completed successfully")
        return GeneratePlanResponse(
            success=result["success"],
            tasks=result["tasks"],
            total_estimated_hours=result["total_estimated_hours"],
            project_summary=result["project_summary"],
            recommendations=result["recommendations"],
            error_message=result.get("error_message")
        )
        
    except Exception as e:
        api_logger.error(f"Unexpected error in generate_plan: {e}")
        return GeneratePlanResponse(
            success=False,
            tasks=[],
            error_message="Internal server error"
        )

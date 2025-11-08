# AI Routes for SmartBoardAI
# Handles AI chat and debug endpoints

import re
from fastapi import APIRouter, HTTPException
from app.models import PromptRequest, PromptResponse
from app.services.java_client import JavaServiceError, JavaTimeoutError, JavaAuthError
from app.logging_config import api_logger

router = APIRouter(prefix="/api/ai", tags=["AI"])

# Import shared service instance
from app.services.ai_service import AIService
ai_service = AIService()

@router.post("/prompt", response_model=PromptResponse)
async def prompt(req: PromptRequest):
    """Main AI prompt endpoint with comprehensive error handling"""
    api_logger.info(f"Prompt request received - user_id: {req.user_id}, project_id: {req.project_id}")
    
    try:
        result = await ai_service.generate_chat_response(
            user_id=req.user_id,
            project_id=req.project_id,
            message=req.message,
            temperature=req.temperature or 0.2,
            max_tokens=req.max_tokens or 512
        )
        
        api_logger.info(f"Prompt request completed successfully for user {req.user_id}")
        return PromptResponse(
            message_id=result["message_id"],
            output=result["output"],
            used_context_keys=result["used_context_keys"],
            meta=result["meta"]
        )
        
    except JavaAuthError as e:
        api_logger.error(f"Java authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed with Java service")
    except JavaTimeoutError as e:
        api_logger.error(f"Java service timeout: {e}")
        raise HTTPException(status_code=504, detail="Java service timeout")
    except JavaServiceError as e:
        api_logger.error(f"Java service error: {e}")
        raise HTTPException(status_code=502, detail=f"Java service error: {e}")
    except Exception as e:
        api_logger.error(f"Unexpected error in prompt endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/generate-plan")
async def generate_plan(request: dict):
    """Generate task plan from user message - simplified endpoint for frontend"""
    api_logger.info(f"Generate plan request received: {request.get('message', '')[:100]}...")
    
    try:
        # Extract message from request
        message = request.get('message', '')
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Create a simplified system prompt for task generation
        system_prompt = """You are an AI assistant that helps users break down projects into actionable tasks. 
        When given a project description, create a structured plan with specific, actionable tasks.
        
        Respond in this format:
        PROJECT SUMMARY:
        [Brief summary of the project]
        
        TASKS:
        1. [Task title] - [Brief description] (Priority: HIGH/MEDIUM/LOW)
        2. [Task title] - [Brief description] (Priority: HIGH/MEDIUM/LOW)
        [Continue with more tasks...]
        
        RECOMMENDATIONS:
        - [Helpful tip or recommendation]
        - [Another recommendation]
        """
        
        # Create messages for AI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Help me create a plan for this project: {message}"}
        ]
        
        # Call AI service directly without context
        result = await ai_service._call_ai_service(messages, 0.2, 1024)
        
        api_logger.info(f"Generate plan completed successfully")
        
        # Parse the AI response to extract tasks
        ai_output = result["output"]
        tasks = []
        
        # Simple parsing to extract tasks (can be improved)
        if "TASKS:" in ai_output:
            tasks_section = ai_output.split("TASKS:")[1]
            if "RECOMMENDATIONS:" in tasks_section:
                tasks_section = tasks_section.split("RECOMMENDATIONS:")[0]
            
            # Extract individual tasks
            task_lines = [line.strip() for line in tasks_section.split('\n') if line.strip() and line.strip()[0].isdigit()]
            for i, task_line in enumerate(task_lines[:10]):  # Limit to 10 tasks
                # Parse task format: "1. Task title - Description (Priority: HIGH)"
                try:
                    parts = task_line.split(' - ', 1)
                    if len(parts) >= 2:
                        title_part = parts[0]
                        desc_part = parts[1]
                        
                        # Extract title (remove number prefix)
                        title = re.sub(r'^\d+\.\s*', '', title_part).strip()
                        
                        # Extract priority
                        priority = "MEDIUM"  # default
                        if "(Priority:" in desc_part:
                            priority_match = re.search(r'\(Priority:\s*(HIGH|MEDIUM|LOW)\)', desc_part, re.IGNORECASE)
                            if priority_match:
                                priority = priority_match.group(1).upper()
                            desc_part = re.sub(r'\s*\(Priority:.*?\)', '', desc_part).strip()
                        
                        tasks.append({
                            "id": f"task_{i+1}",
                            "title": title,
                            "description": desc_part,
                            "priority": priority,
                            "estimated_hours": 2,  # default estimate
                            "category": "general",
                            "dependencies": []
                        })
                except:
                    # If parsing fails, create a simple task
                    tasks.append({
                        "id": f"task_{i+1}",
                        "title": task_line.strip(),
                        "description": "Generated task",
                        "priority": "MEDIUM",
                        "estimated_hours": 2,
                        "category": "general",
                        "dependencies": []
                    })
        
        # Return in format expected by frontend
        return {
            "success": True,
            "tasks": tasks,
            "project_summary": ai_output,
            "recommendations": [],
            "request_id": result["message_id"]
        }
        
    except Exception as e:
        api_logger.error(f"Error in generate-plan endpoint: {e}")
        return {
            "success": False,
            "error_message": str(e),
            "tasks": [],
            "project_summary": f"Error generating plan: {str(e)}",
            "recommendations": []
        }

@router.post("/debug/test-ai")
async def debug_test_ai():
    """Debug endpoint to test AI response format"""
    api_logger.info("Debug AI test requested")
    
    try:
        result = await ai_service.generate_debug_response()
        api_logger.info(f"AI response: {result['raw_response']}")
        return result
        
    except Exception as e:
        api_logger.error(f"Debug test failed: {e}")
        return {
            "error": str(e),
            "success": False
        }
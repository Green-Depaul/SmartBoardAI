# AI Routes for SmartBoardAI
# Handles AI chat and debug endpoints

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
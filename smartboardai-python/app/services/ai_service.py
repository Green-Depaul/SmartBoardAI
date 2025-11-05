# AI Service for SmartBoardAI
# Handles all AI-related business logic

from typing import Dict, Any, List, Optional
import json
import re
from app.services.together import chat_completion, TogetherAIError, TogetherTimeoutError
from app.services.java_client import get_user_profile, get_project_context, post_activity_log, JavaServiceError, JavaTimeoutError, JavaAuthError
from app.prompts.system_prompts import SystemPrompts
from app.prompts.templates import PromptTemplates
from app.prompts.constants import PromptConstants
from app.logging_config import api_logger, error_logger

class AIService:
    """Service class for AI-related business logic"""
    
    def __init__(self):
        pass  # No need to store service instances
    
    async def generate_chat_response(self, 
                                   user_id: str, 
                                   project_id: str, 
                                   message: str,
                                   temperature: float = PromptConstants.DEFAULT_TEMPERATURE,
                                   max_tokens: int = PromptConstants.DEFAULT_MAX_TOKENS) -> Dict[str, Any]:
        """
        Generate AI chat response with context
        
        Returns:
            Dict containing message_id, output, used_context_keys, and meta
        """
        api_logger.info(f"Generating chat response for user {user_id}, project {project_id}")
        
        # Get context from Java service
        user, project, used_keys = await self._get_context_data(user_id, project_id)
        
        # Build context string
        context_text, _ = PromptTemplates.build_context_prompt(user, project, user_id, project_id)
        
        # Build messages
        system_msg = {"role": "system", "content": SystemPrompts.GENERAL_ASSISTANT}
        user_msg = {"role": "user", "content": f"Context:\n{context_text}\n\nUser message:\n{message}"}
        
        # Call AI service
        result = await self._call_ai_service([system_msg, user_msg], temperature, max_tokens)
        
        # Log activity (non-blocking)
        await self._log_activity(user_id, project_id, result["message_id"], "chat")
        
        return {
            "message_id": result["message_id"],
            "output": result["output"],
            "used_context_keys": used_keys,
            "meta": {"model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"}
        }
    
    async def generate_debug_response(self) -> Dict[str, Any]:
        """Generate simple debug response"""
        api_logger.info("Generating debug AI response")
        
        messages = [
            {"role": "system", "content": SystemPrompts.DEBUG_TEST},
            {"role": "user", "content": "Say hello"}
        ]
        
        result = await self._call_ai_service(messages, 0.1, 100)
        
        return {
            "raw_response": result["output"],
            "message_id": result["message_id"],
            "success": True
        }
    
    async def _get_context_data(self, user_id: str, project_id: str) -> tuple[Optional[Dict], Optional[Dict], List[str]]:
        """Get user and project context data from Java service"""
        user = None
        project = None
        used_keys = []
        
        try:
            user = await get_user_profile(user_id)
            project = await get_project_context(project_id)
            api_logger.info("Successfully retrieved context from Java service")
            used_keys = ["project.name", "project.description", "project.deadline", "user.displayName", "user.role"]
        except JavaAuthError as e:
            api_logger.error(f"Java authentication failed: {e}")
            raise
        except JavaTimeoutError as e:
            api_logger.error(f"Java service timeout: {e}")
            raise
        except JavaServiceError as e:
            api_logger.error(f"Java service error: {e}")
            raise
        except Exception as e:
            api_logger.error(f"Unexpected error retrieving context: {e}")
            raise
        
        return user, project, used_keys
    
    async def _call_ai_service(self, messages: List[Dict], temperature: float, max_tokens: int) -> Dict[str, Any]:
        """Call Together.ai service with error handling"""
        try:
            result = await chat_completion(
                messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            api_logger.info(f"Successfully generated AI response with message_id: {result['message_id']}")
            return result
        except TogetherTimeoutError as e:
            api_logger.error(f"Together.ai timeout: {e}")
            raise
        except TogetherAIError as e:
            api_logger.error(f"Together.ai error: {e}")
            raise
        except Exception as e:
            api_logger.error(f"Unexpected error calling AI service: {e}")
            raise
    
    async def _log_activity(self, user_id: str, project_id: str, message_id: str, action: str = "chat") -> None:
        """Log activity to Java service (non-blocking)"""
        try:
            await post_activity_log({
                "userId": user_id,
                "projectId": project_id,
                "messageId": message_id,
                "source": "python-middleware",
                "action": action
            })
            api_logger.info("Activity logged successfully")
        except Exception as e:
            api_logger.warning(f"Failed to log activity (non-fatal): {e}")

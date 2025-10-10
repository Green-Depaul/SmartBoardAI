import httpx
import uuid
from typing import Dict, Any, Optional
from app.config import settings
from app.logging_config import together_logger, error_logger

class TogetherAIError(Exception):
    """Custom exception for Together.ai API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.status_code = status_code
        super().__init__(message)

class TogetherTimeoutError(TogetherAIError):
    """Raised when Together.ai API times out"""
    pass

async def chat_completion(messages: list, temperature: float = 0.2, max_tokens: int = 512) -> dict:
    """Call Together.ai chat completion API with error handling and logging"""
    headers = {
        "Authorization": f"Bearer {settings.together_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.together_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    url = f"{settings.together_base_url.rstrip('/')}/chat/completions"
    
    try:
        together_logger.info(f"Calling Together.ai with model: {settings.together_model}")
        together_logger.debug(f"Request payload: {payload}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            # Log response status
            together_logger.info(f"Together.ai responded with status: {response.status_code}")
            
            # Handle different status codes
            if response.status_code == 401:
                error_msg = "Together.ai API key invalid or expired"
                together_logger.error(error_msg)
                raise TogetherAIError(error_msg, 401)
            
            elif response.status_code == 429:
                error_msg = "Together.ai rate limit exceeded"
                together_logger.warning(error_msg)
                raise TogetherAIError(error_msg, 429)
            
            elif response.status_code >= 500:
                error_msg = f"Together.ai server error: {response.status_code}"
                together_logger.error(error_msg)
                raise TogetherAIError(error_msg, response.status_code)
            
            elif not response.is_success:
                error_msg = f"Together.ai API error: {response.status_code}"
                together_logger.error(error_msg)
                raise TogetherAIError(error_msg, response.status_code)
            
            # Parse successful response
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Log usage statistics if available
            if "usage" in data:
                usage = data["usage"]
                together_logger.info(f"Token usage - prompt: {usage.get('prompt_tokens', 'N/A')}, "
                                   f"completion: {usage.get('completion_tokens', 'N/A')}, "
                                   f"total: {usage.get('total_tokens', 'N/A')}")
            
            result = {
                "message_id": data.get("id", str(uuid.uuid4())),
                "output": content,
                "raw": data,
            }
            
            together_logger.info(f"Successfully generated response with message_id: {result['message_id']}")
            return result
            
    except httpx.TimeoutException as e:
        error_msg = f"Together.ai request timed out after 60s"
        together_logger.error(error_msg)
        raise TogetherTimeoutError(error_msg)
        
    except httpx.HTTPError as e:
        error_msg = f"HTTP error calling Together.ai: {e}"
        together_logger.error(error_msg)
        raise TogetherAIError(error_msg)
        
    except KeyError as e:
        error_msg = f"Unexpected response format from Together.ai: missing {e}"
        together_logger.error(error_msg)
        raise TogetherAIError(error_msg)
        
    except Exception as e:
        error_msg = f"Unexpected error calling Together.ai: {e}"
        error_logger.error(error_msg)
        raise TogetherAIError(error_msg)
from typing import Optional, Dict, Any
import httpx
import asyncio
from app.config import settings
from app.logging_config import java_logger, error_logger

class JavaServiceError(Exception):
    """Custom exception for Java service errors"""
    def __init__(self, message: str, status_code: Optional[int] = None, endpoint: Optional[str] = None):
        self.status_code = status_code
        self.endpoint = endpoint
        super().__init__(message)

class JavaTimeoutError(JavaServiceError):
    """Raised when Java service times out"""
    pass

class JavaAuthError(JavaServiceError):
    """Raised when Java service authentication fails"""
    pass

def _headers() -> Dict[str, str]:
    h = {}
    if settings.java_api_key:
        h["X-API-Key"] = settings.java_api_key
    if settings.java_auth_bearer:
        h["Authorization"] = f"Bearer {settings.java_auth_bearer}"
    return h

async def _make_request_with_retry(
    method: str,
    url: str,
    max_retries: int = 3,
    timeout: float = 10.0,
    **kwargs
) -> httpx.Response:
    """Make HTTP request with exponential backoff retry logic"""
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            java_logger.info(f"Attempting {method} {url} (attempt {attempt + 1}/{max_retries + 1})")
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(method, url, **kwargs)
                
                # Log successful response
                java_logger.info(f"Java service responded with {response.status_code}")
                
                # Handle auth errors immediately (no retry)
                if response.status_code == 401:
                    error_msg = f"Authentication failed for {url}"
                    java_logger.error(error_msg)
                    raise JavaAuthError(error_msg, 401, url)
                
                # Handle client errors (4xx) - don't retry
                if 400 <= response.status_code < 500:
                    error_msg = f"Client error {response.status_code} for {url}"
                    java_logger.warning(error_msg)
                    raise JavaServiceError(error_msg, response.status_code, url)
                
                # Handle server errors (5xx) - retry
                if response.status_code >= 500:
                    error_msg = f"Server error {response.status_code} for {url}"
                    java_logger.warning(error_msg)
                    if attempt < max_retries:
                        wait_time = 2 ** attempt  # Exponential backoff
                        java_logger.info(f"Retrying in {wait_time} seconds...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        raise JavaServiceError(error_msg, response.status_code, url)
                
                # Success
                return response
                
        except httpx.TimeoutException as e:
            last_exception = JavaTimeoutError(f"Timeout after {timeout}s for {url}", endpoint=url)
            java_logger.warning(f"Timeout on attempt {attempt + 1}: {e}")
            
        except httpx.ConnectError as e:
            last_exception = JavaServiceError(f"Connection failed to {url}: {e}", endpoint=url)
            java_logger.warning(f"Connection error on attempt {attempt + 1}: {e}")
            
        except httpx.HTTPError as e:
            last_exception = JavaServiceError(f"HTTP error for {url}: {e}", endpoint=url)
            java_logger.warning(f"HTTP error on attempt {attempt + 1}: {e}")
        
        # If we get here, it's a retryable error
        if attempt < max_retries:
            wait_time = 2 ** attempt
            java_logger.info(f"Retrying in {wait_time} seconds...")
            await asyncio.sleep(wait_time)
        else:
            error_logger.error(f"All retry attempts failed for {url}")
            raise last_exception
    
    # This should never be reached, but just in case
    raise last_exception

async def ping() -> bool:
    """Check if Java service is healthy"""
    url = f"{settings.java_base_url.rstrip('/')}{settings.java_health_path}"
    try:
        response = await _make_request_with_retry("GET", url, timeout=5.0)
        java_logger.info("Java service health check passed")
        return True
    except Exception as e:
        java_logger.error(f"Java service health check failed: {e}")
        return False

async def get_user_profile(user_id: str) -> Dict[str, Any]:
    """Get user profile from Java service with error handling"""
    url = f"{settings.java_base_url.rstrip('/')}/api/users/{user_id}"
    try:
        response = await _make_request_with_retry("GET", url, headers=_headers())
        data = response.json()
        java_logger.info(f"Retrieved user profile for user_id: {user_id}")
        return data
    except Exception as e:
        error_logger.error(f"Failed to get user profile for {user_id}: {e}")
        raise

async def get_project_context(project_id: str) -> Dict[str, Any]:
    """Get project context from Java service with error handling"""
    url = f"{settings.java_base_url.rstrip('/')}/api/projects/{project_id}/context"
    try:
        response = await _make_request_with_retry("GET", url, headers=_headers())
        data = response.json()
        java_logger.info(f"Retrieved project context for project_id: {project_id}")
        return data
    except Exception as e:
        error_logger.error(f"Failed to get project context for {project_id}: {e}")
        raise

async def post_activity_log(payload: Dict[str, Any]) -> None:
    """Log activity to Java service (fire-and-forget with error handling)"""
    url = f"{settings.java_base_url.rstrip('/')}/api/activity"
    try:
        await _make_request_with_retry("POST", url, json=payload, headers=_headers(), timeout=5.0)
        java_logger.info(f"Activity logged successfully: {payload.get('messageId', 'unknown')}")
    except Exception as e:
        # Non-fatal - log but don't raise
        error_logger.warning(f"Failed to log activity (non-fatal): {e}")
        pass
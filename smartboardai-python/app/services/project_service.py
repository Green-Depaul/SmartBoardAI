# Project Service for SmartBoardAI
# Handles project planning and task generation business logic

from typing import Dict, Any, List, Optional
import json
import re
from app.services.together import chat_completion, TogetherAIError, TogetherTimeoutError
from app.services.java_client import get_user_profile, get_project_context, post_activity_log, JavaServiceError, JavaTimeoutError, JavaAuthError
from app.prompts.system_prompts import SystemPrompts
from app.prompts.templates import PromptTemplates
from app.prompts.constants import PromptConstants
from app.models import ProjectStep, Task
from app.logging_config import api_logger, error_logger

class ProjectService:
    """Service class for project planning business logic"""
    
    def __init__(self):
        pass  # No need to store service instances
    
    async def generate_project_steps(self, 
                                   user_id: str, 
                                   project_id: str, 
                                   project_description: str,
                                   project_type: Optional[str] = None,
                                   complexity: str = PromptConstants.COMPLEXITY_MEDIUM,
                                   timeline: Optional[str] = None,
                                   team_size: Optional[int] = None,
                                   temperature: float = PromptConstants.DEFAULT_STEPS_TEMPERATURE) -> Dict[str, Any]:
        """
        Generate detailed project steps
        
        Returns:
            Dict containing project_steps, total_estimated_duration, project_summary, recommendations
        """
        api_logger.info(f"Generating project steps for user {user_id}, project {project_id}")
        
        # Get context with fallback to demo data
        user, project = await self._get_context_with_fallback(user_id, project_id)
        
        # Build context for step generation
        request_params = {
            "project_type": project_type,
            "complexity": complexity,
            "timeline": timeline,
            "team_size": team_size
        }
        context_text = PromptTemplates.build_steps_generation_context(user, project, request_params)
        
        # Build prompts
        system_prompt = SystemPrompts.PROJECT_STEPS_GENERATION
        user_prompt = f"""Context:
{context_text}

Project Description:
{project_description}

Please generate detailed project steps for this project."""
        
        # Call AI service
        result = await self._call_ai_service([{"role": "system", "content": system_prompt}, 
                                            {"role": "user", "content": user_prompt}], 
                                           temperature, 
                                           PromptConstants.DEFAULT_STEPS_MAX_TOKENS)
        
        # Parse and validate response
        parsed_response = self._parse_steps_response(result["output"])
        
        # Log activity
        await self._log_activity(user_id, project_id, result["message_id"], "generate_steps", 
                                {"stepsCount": len(parsed_response["project_steps"])})
        
        return {
            "message_id": result["message_id"],
            "project_steps": parsed_response["project_steps"],
            "total_estimated_duration": parsed_response["total_estimated_duration"],
            "project_summary": parsed_response["project_summary"],
            "recommendations": parsed_response["recommendations"],
            "meta": {
                "model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                "steps_count": len(parsed_response["project_steps"]),
                "complexity": complexity,
                "project_type": project_type
            }
        }
    
    async def generate_tasks(self, 
                           prompt: str,
                           project_type: Optional[str] = None,
                           complexity: str = PromptConstants.COMPLEXITY_MEDIUM,
                           team_size: Optional[int] = None,
                           timeline: Optional[str] = None,
                           max_tasks: int = 10) -> Dict[str, Any]:
        """
        Generate project tasks from prompt
        
        Returns:
            Dict containing success status, tasks, and metadata
        """
        api_logger.info("Generating project tasks")
        
        # Validate input
        if not prompt.strip():
            return {
                "success": False,
                "tasks": [],
                "error_message": "Prompt cannot be empty"
            }
        
        # Build context
        request_params = {
            "project_type": project_type,
            "complexity": complexity,
            "team_size": team_size,
            "timeline": timeline,
            "max_tasks": max_tasks
        }
        context_text = PromptTemplates.build_task_generation_context(request_params)
        
        # Build prompts
        system_prompt = SystemPrompts.TASK_GENERATION_TEMPLATE.format(
            context=context_text,
            max_tasks=max_tasks
        )
        user_prompt = f"""Project Description:
{prompt}

Please break this down into {max_tasks} specific, actionable tasks."""
        
        # Call AI service
        try:
            result = await self._call_ai_service([{"role": "system", "content": system_prompt}, 
                                                {"role": "user", "content": user_prompt}], 
                                               PromptConstants.DEFAULT_TASKS_TEMPERATURE, 
                                               PromptConstants.DEFAULT_TASKS_MAX_TOKENS)
            
            # Parse and validate response
            parsed_response = self._parse_tasks_response(result["output"])
            
            if not parsed_response["tasks"]:
                return {
                    "success": False,
                    "tasks": [],
                    "error_message": "No valid tasks could be generated"
                }
            
            api_logger.info(f"Successfully generated {len(parsed_response['tasks'])} tasks")
            
            return {
                "success": True,
                "tasks": parsed_response["tasks"],
                "total_estimated_hours": parsed_response["total_estimated_hours"],
                "project_summary": parsed_response["project_summary"],
                "recommendations": parsed_response["recommendations"]
            }
            
        except TogetherTimeoutError as e:
            api_logger.error(f"Together.ai timeout: {e}")
            return {"success": False, "tasks": [], "error_message": "AI service timeout"}
        except TogetherAIError as e:
            api_logger.error(f"Together.ai error: {e}")
            if e.status_code == 429:
                return {"success": False, "tasks": [], "error_message": "AI service rate limit exceeded"}
            elif e.status_code == 401:
                return {"success": False, "tasks": [], "error_message": "AI service authentication failed"}
            else:
                return {"success": False, "tasks": [], "error_message": f"AI service error: {e}"}
        except Exception as e:
            api_logger.error(f"Unexpected error calling AI service: {e}")
            return {"success": False, "tasks": [], "error_message": "Internal server error"}
    
    async def _get_context_with_fallback(self, user_id: str, project_id: str) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Get context data with fallback to demo data"""
        user = None
        project = None
        
        try:
            user = await get_user_profile(user_id)
            project = await get_project_context(project_id)
            api_logger.info("Successfully retrieved context for steps generation")
        except JavaAuthError as e:
            api_logger.warning(f"Java authentication failed, using demo context: {e}")
            user, project = self._get_demo_context()
        except JavaTimeoutError as e:
            api_logger.warning(f"Java service timeout, using demo context: {e}")
            user, project = self._get_demo_context()
        except JavaServiceError as e:
            api_logger.warning(f"Java service error, using demo context: {e}")
            user, project = self._get_demo_context()
        except Exception as e:
            api_logger.warning(f"Unexpected error retrieving context, using demo context: {e}")
            user, project = self._get_demo_context()
        
        return user, project
    
    def _get_demo_context(self) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Get demo context data for testing"""
        return (
            {"displayName": "Demo User", "name": "Demo User", "role": "Developer"},
            {"name": "Demo Project", "title": "Demo Project"}
        )
    
    async def _call_ai_service(self, messages: List[Dict], temperature: float, max_tokens: int) -> Dict[str, Any]:
        """Call Together.ai service"""
        result = await chat_completion(
            messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        api_logger.info(f"Successfully generated AI response with message_id: {result['message_id']}")
        return result
    
    def _parse_steps_response(self, raw_content: str) -> Dict[str, Any]:
        """Parse AI response for project steps"""
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = raw_content
                
            ai_response = json.loads(json_str)
            
            # Validate and convert steps
            project_steps = []
            for step_data in ai_response.get(PromptConstants.JSON_KEY_PROJECT_STEPS, []):
                try:
                    step = ProjectStep(
                        step_number=step_data["step_number"],
                        title=step_data["title"],
                        description=step_data["description"],
                        estimated_duration=step_data.get("estimated_duration"),
                        dependencies=step_data.get("dependencies", []),
                        priority=step_data.get("priority", PromptConstants.PRIORITY_MEDIUM),
                        category=step_data.get("category")
                    )
                    project_steps.append(step)
                except Exception as step_error:
                    api_logger.warning(f"Failed to parse step {step_data}: {step_error}")
                    continue
            
            if not project_steps:
                raise ValueError("No valid steps generated")
                
            api_logger.info(f"Successfully parsed {len(project_steps)} project steps")
            
            return {
                "project_steps": project_steps,
                "total_estimated_duration": ai_response.get(PromptConstants.JSON_KEY_TOTAL_DURATION),
                "project_summary": ai_response.get(PromptConstants.JSON_KEY_PROJECT_SUMMARY, ""),
                "recommendations": ai_response.get(PromptConstants.JSON_KEY_RECOMMENDATIONS, [])
            }
            
        except json.JSONDecodeError as e:
            api_logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError("AI service returned invalid JSON")
        except Exception as e:
            api_logger.error(f"Failed to parse AI response: {e}")
            raise ValueError("Failed to parse AI response")
    
    def _parse_tasks_response(self, raw_output: str) -> Dict[str, Any]:
        """Parse AI response for tasks"""
        try:
            # Clean the AI response - remove markdown code blocks if present
            raw_output = raw_output.strip()
            
            # Remove markdown code blocks
            if raw_output.startswith("```json"):
                raw_output = raw_output[7:]  # Remove ```json
            if raw_output.startswith("```"):
                raw_output = raw_output[3:]   # Remove ```
            if raw_output.endswith("```"):
                raw_output = raw_output[:-3]  # Remove trailing ```
            
            # Extract JSON from the response
            json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
            if json_match:
                json_str = json_match.group()
            else:
                json_str = raw_output
            
            ai_response = json.loads(json_str)
            
            # Convert to Task objects
            tasks = []
            for task_data in ai_response.get(PromptConstants.JSON_KEY_TASKS, []):
                try:
                    task = Task(
                        title=task_data["title"],
                        description=task_data["description"],
                        estimated_hours=task_data.get("estimated_hours"),
                        priority=task_data.get("priority", PromptConstants.PRIORITY_MEDIUM),
                        category=task_data.get("category"),
                        dependencies=task_data.get("dependencies", [])
                    )
                    tasks.append(task)
                except Exception as task_error:
                    api_logger.warning(f"Failed to parse task: {task_error}")
                    continue
            
            api_logger.info(f"Successfully parsed {len(tasks)} tasks")
            
            return {
                "tasks": tasks,
                "total_estimated_hours": ai_response.get(PromptConstants.JSON_KEY_TOTAL_HOURS),
                "project_summary": ai_response.get(PromptConstants.JSON_KEY_PROJECT_SUMMARY),
                "recommendations": ai_response.get(PromptConstants.JSON_KEY_RECOMMENDATIONS, [])
            }
            
        except json.JSONDecodeError as e:
            api_logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError("AI service returned invalid response")
        except Exception as e:
            api_logger.error(f"Failed to parse AI response: {e}")
            raise ValueError("Failed to parse AI response")
    
    async def _log_activity(self, user_id: str, project_id: str, message_id: str, action: str, extra_data: Optional[Dict] = None) -> None:
        """Log activity to Java service (non-blocking)"""
        try:
            payload = {
                "userId": user_id,
                "projectId": project_id,
                "messageId": message_id,
                "source": "python-middleware",
                "action": action
            }
            if extra_data:
                payload.update(extra_data)
                
            await post_activity_log(payload)
            api_logger.info(f"{action} activity logged successfully")
        except Exception as e:
            api_logger.warning(f"Failed to log activity (non-fatal): {e}")

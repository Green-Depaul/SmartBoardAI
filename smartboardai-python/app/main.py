from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import HealthResponse, PromptRequest, PromptResponse, GenerateStepsRequest, GenerateStepsResponse, ProjectStep
from app.services import java_client, together
from app.logging_config import setup_logging, api_logger, error_logger
from app.services.java_client import JavaServiceError, JavaTimeoutError, JavaAuthError
from app.services.together import TogetherAIError, TogetherTimeoutError

# Initialize logging
setup_logging()

app = FastAPI(title="SmartBoardAI Python Middleware", version="0.2.0")

# CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_origins == ["*"] else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint with Java service status"""
    api_logger.info("Health check requested")
    java_ok = await java_client.ping()
    api_logger.info(f"Health check completed - Java service: {'OK' if java_ok else 'FAILED'}")
    return HealthResponse(status="ok", java_ok=java_ok)

@app.post("/prompt", response_model=PromptResponse)
async def prompt(req: PromptRequest):
    """Main AI prompt endpoint with comprehensive error handling"""
    api_logger.info(f"Prompt request received - user_id: {req.user_id}, project_id: {req.project_id}")
    
    # 1) Pull context from Java with error handling
    try:
        user = await java_client.get_user_profile(req.user_id)
        project = await java_client.get_project_context(req.project_id)
        api_logger.info("Successfully retrieved context from Java service")
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
        api_logger.error(f"Unexpected error retrieving context: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    # 2) Build context string
    context_lines = []
    if project:
        name = project.get("name") or project.get("title") or "unknown"
        context_lines.append(f"Project: {name} (id={req.project_id})")
        if project.get("description"): 
            context_lines.append(f"Description: {project['description']}")
        if project.get("deadline"): 
            context_lines.append(f"Deadline: {project['deadline']}")
    if user:
        dn = user.get("displayName") or user.get("name") or "unknown"
        context_lines.append(f"User: {dn} (id={req.user_id})")
        if user.get("role"): 
            context_lines.append(f"Role: {user['role']}")

    context_text = "\n".join(context_lines)
    used_keys = ["project.name","project.description","project.deadline","user.displayName","user.role"]
    api_logger.debug(f"Built context with {len(context_lines)} lines")

    # 3) Call Together.ai with error handling
    system_msg = {
        "role": "system",
        "content": "You are SmartBoardAI's assistant. Use the provided context faithfully.",
    }
    user_msg = {
        "role": "user",
        "content": f"Context:\n{context_text}\n\nUser message:\n{req.message}",
    }

    try:
        result = await together.chat_completion(
            [system_msg, user_msg],
            temperature=req.temperature or 0.2,
            max_tokens=req.max_tokens or 512,
        )
        api_logger.info(f"Successfully generated AI response with message_id: {result['message_id']}")
    except TogetherTimeoutError as e:
        api_logger.error(f"Together.ai timeout: {e}")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except TogetherAIError as e:
        api_logger.error(f"Together.ai error: {e}")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded")
        elif e.status_code == 401:
            raise HTTPException(status_code=502, detail="AI service authentication failed")
        else:
            raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    except Exception as e:
        api_logger.error(f"Unexpected error calling AI service: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    # 4) Log activity to Java (non-blocking)
    try:
        await java_client.post_activity_log({
            "userId": req.user_id,
            "projectId": req.project_id,
            "messageId": result["message_id"],
            "source": "python-middleware",
        })
        api_logger.info("Activity logged successfully")
    except Exception as e:
        api_logger.warning(f"Failed to log activity (non-fatal): {e}")

    api_logger.info(f"Prompt request completed successfully for user {req.user_id}")
    return PromptResponse(
        message_id=result["message_id"],
        output=result["output"],
        used_context_keys=used_keys,
        meta={"model": settings.together_model},
    )

@app.post("/projects/generate-steps", response_model=GenerateStepsResponse)
async def generate_project_steps(req: GenerateStepsRequest):
    """Generate detailed project steps from user input with AI assistance"""
    api_logger.info(f"Project steps generation requested - user_id: {req.user_id}, project_id: {req.project_id}")
    
    # 1) Get user and project context from Java
    try:
        user = await java_client.get_user_profile(req.user_id)
        project = await java_client.get_project_context(req.project_id)
        api_logger.info("Successfully retrieved context for steps generation")
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
        api_logger.error(f"Unexpected error retrieving context: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    # 2) Build comprehensive context for step generation
    context_parts = []
    
    # User context
    if user:
        user_name = user.get("displayName") or user.get("name") or "User"
        user_role = user.get("role", "")
        context_parts.append(f"User: {user_name} ({user_role})")
    
    # Project context
    if project:
        project_name = project.get("name") or project.get("title") or "Project"
        context_parts.append(f"Project: {project_name}")
        if project.get("description"):
            context_parts.append(f"Existing description: {project['description']}")
        if project.get("deadline"):
            context_parts.append(f"Deadline: {project['deadline']}")
    
    # Request parameters
    context_parts.append(f"Project type: {req.project_type or 'General'}")
    context_parts.append(f"Complexity: {req.complexity}")
    if req.timeline:
        context_parts.append(f"Timeline: {req.timeline}")
    if req.team_size:
        context_parts.append(f"Team size: {req.team_size} members")

    context_text = "\n".join(context_parts)
    api_logger.debug(f"Built context for steps generation with {len(context_parts)} parts")

    # 3) Create specialized prompt for step generation
    system_prompt = """You are SmartBoardAI's project planning assistant. Your task is to break down a project description into detailed, actionable steps.

For each step, provide:
- A clear, concise title
- Detailed description of what needs to be done
- Estimated duration (be realistic)
- Dependencies (which other steps must be completed first)
- Priority level (low, medium, high)
- Category (planning, research, development, testing, deployment, etc.)

Return your response as a JSON object with this exact structure:
{
  "project_steps": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "Detailed description",
      "estimated_duration": "2-3 days",
      "dependencies": [],
      "priority": "high",
      "category": "planning"
    }
  ],
  "total_estimated_duration": "Overall project timeline",
  "project_summary": "Brief summary of the project",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Make steps specific, actionable, and realistic. Consider the project complexity and team size."""

    user_prompt = f"""Context:
{context_text}

Project Description:
{req.project_description}

Please generate detailed project steps for this project."""

    # 4) Call Together.ai with specialized parameters
    try:
        result = await together.chat_completion(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=req.temperature,
            max_tokens=2048,  # Larger token limit for detailed step generation
        )
        api_logger.info(f"Successfully generated project steps with message_id: {result['message_id']}")
    except TogetherTimeoutError as e:
        api_logger.error(f"Together.ai timeout: {e}")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except TogetherAIError as e:
        api_logger.error(f"Together.ai error: {e}")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail="AI service rate limit exceeded")
        elif e.status_code == 401:
            raise HTTPException(status_code=502, detail="AI service authentication failed")
        else:
            raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    except Exception as e:
        api_logger.error(f"Unexpected error calling AI service: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    # 5) Parse AI response and validate structure
    try:
        import json
        ai_response = json.loads(result["output"])
        
        # Validate and convert steps
        project_steps = []
        for step_data in ai_response.get("project_steps", []):
            try:
                step = ProjectStep(
                    step_number=step_data["step_number"],
                    title=step_data["title"],
                    description=step_data["description"],
                    estimated_duration=step_data.get("estimated_duration"),
                    dependencies=step_data.get("dependencies", []),
                    priority=step_data.get("priority", "medium"),
                    category=step_data.get("category")
                )
                project_steps.append(step)
            except Exception as step_error:
                api_logger.warning(f"Failed to parse step {step_data}: {step_error}")
                continue
        
        if not project_steps:
            raise ValueError("No valid steps generated")
            
        api_logger.info(f"Successfully parsed {len(project_steps)} project steps")
        
    except json.JSONDecodeError as e:
        api_logger.error(f"Failed to parse AI response as JSON: {e}")
        raise HTTPException(status_code=502, detail="AI service returned invalid JSON")
    except Exception as e:
        api_logger.error(f"Failed to parse AI response: {e}")
        raise HTTPException(status_code=502, detail="Failed to parse AI response")

    # 6) Log activity to Java (non-blocking)
    try:
        await java_client.post_activity_log({
            "userId": req.user_id,
            "projectId": req.project_id,
            "messageId": result["message_id"],
            "source": "python-middleware",
            "action": "generate_steps",
            "stepsCount": len(project_steps)
        })
        api_logger.info("Steps generation activity logged successfully")
    except Exception as e:
        api_logger.warning(f"Failed to log activity (non-fatal): {e}")

    api_logger.info(f"Project steps generation completed successfully for user {req.user_id}")
    return GenerateStepsResponse(
        message_id=result["message_id"],
        project_steps=project_steps,
        total_estimated_duration=ai_response.get("total_estimated_duration"),
        project_summary=ai_response.get("project_summary", ""),
        recommendations=ai_response.get("recommendations", []),
        meta={
            "model": settings.together_model,
            "steps_count": len(project_steps),
            "complexity": req.complexity,
            "project_type": req.project_type
        }
    )
# SmartBoardAI Python Middleware

A Python FastAPI application that serves as middleware between React frontend, Java backend, and Together.ai for AI-powered project planning.

## Features

- **AI-Powered Task Generation** - Generate project tasks using Together.ai
- **Project Steps Generation** - Break down projects into detailed steps
- **Java Backend Integration** - Seamless communication with Java services
- **Robust Error Handling** - Comprehensive error handling and logging
- **RESTful API** - Clean, documented API endpoints

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file or set environment variables:

```bash
# Required
TOGETHER_API_KEY=your_together_api_key_here

# Optional (defaults provided)
TOGETHER_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
APP_HOST=0.0.0.0
APP_PORT=8080
APP_ENV=dev
JAVA_BASE_URL=http://localhost:8081
```

### 3. Run the Application

```bash
# Development mode
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# Or run directly
python -m app.main
```

The app will start on `http://localhost:8080`

## API Endpoints

### Health Check
- **GET** `/health` - Check application and Java service health

### AI Task Generation
- **POST** `/generate_plan` - Generate project tasks from a prompt

**Request:**
```json
{
  "prompt": "Build a mobile app for food delivery",
  "project_type": "software",
  "complexity": "high",
  "team_size": 5,
  "timeline": "3 months",
  "max_tasks": 10
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid-here",
      "title": "Requirements Analysis",
      "description": "Gather and document functional requirements",
      "estimated_hours": 16,
      "priority": "high",
      "category": "planning",
      "dependencies": []
    }
  ],
  "total_estimated_hours": 120,
  "project_summary": "Mobile food delivery app",
  "recommendations": ["Use React Native", "Implement offline mode"],
  "error_message": null,
  "request_id": "uuid-here"
}
```

### Project Steps Generation
- **POST** `/projects/generate-steps` - Generate detailed project steps (requires user/project context)

### General AI Chat
- **POST** `/prompt` - General AI chat with project context

## Together.ai Model Recommendations

### Current Model: `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
- **Best for**: General project planning, task breakdown
- **Speed**: Fast
- **Cost**: Moderate
- **Quality**: High

### Alternative Models

1. **`meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`**
   - Best for: Simple projects, faster responses
   - Speed: Very Fast
   - Cost: Low

2. **`mistralai/Mixtral-8x7B-Instruct-v0.1`**
   - Best for: Complex project analysis
   - Speed: Moderate
   - Cost: Moderate

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TOGETHER_API_KEY` | Yes | - | Your Together.ai API key |
| `TOGETHER_MODEL` | No | `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` | AI model to use |
| `APP_HOST` | No | `0.0.0.0` | Host to bind to |
| `APP_PORT` | No | `8080` | Port to listen on |
| `APP_ENV` | No | `dev` | Environment (dev/prod) |
| `JAVA_BASE_URL` | No | `http://localhost:8081` | Java backend URL |

## Error Handling

The application handles various error scenarios:

- **Missing API Key**: Returns error on startup
- **Empty Prompt**: Returns structured error response
- **AI Service Errors**: Graceful handling with specific error messages
- **Network Timeouts**: Timeout handling for external services
- **Malformed Responses**: JSON parsing validation

## Integration with Java Backend

The `/generate_plan` endpoint is designed to be compatible with Java backend expectations:

```java
// Java example
public class TaskResponse {
    private boolean success;
    private List<Task> tasks;
    private Integer totalEstimatedHours;
    private String projectSummary;
    private List<String> recommendations;
    private String errorMessage;
    private String requestId;
}
```

## Testing

### Using curl

```bash
# Health check
curl http://localhost:8080/health

# Generate tasks
curl -X POST http://localhost:8080/generate_plan \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a website for a small business",
    "project_type": "web",
    "complexity": "medium",
    "max_tasks": 5
  }'
```

### Using Python requests

```python
import requests

response = requests.post(
    "http://localhost:8080/generate_plan",
    json={
        "prompt": "Build a mobile app for food delivery",
        "project_type": "software",
        "complexity": "high",
        "max_tasks": 8
    }
)

print(response.json())
```

## Logging

The application uses structured logging with different loggers:

- `api` - API request/response logging
- `java_client` - Java service communication
- `together` - Together.ai API calls
- `errors` - Error logging

Logs include timestamps, function names, and detailed error information.

## Deployment

### Development
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 4
```

### Docker (Optional)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Troubleshooting

### Common Issues

1. **"TOGETHER_API_KEY environment variable is required"**
   - Set the `TOGETHER_API_KEY` environment variable
   - Or create a `.env` file with the key

2. **"Invalid API key"**
   - Verify your Together.ai API key is correct
   - Check your Together.ai account credits

3. **"Rate limit exceeded"**
   - Reduce request frequency
   - Consider upgrading your Together.ai plan

4. **"Java service timeout"**
   - Check if Java backend is running
   - Verify `JAVA_BASE_URL` is correct

### Logs

Check console output for debugging information. The app logs:
- Request received
- AI service calls
- Errors and warnings
- Task generation success

## Architecture

```
React Frontend
    ↓
Python Middleware (This App)
    ↓                    ↓
Java Backend ←→ SQL Database
    ↓
Together.ai LLM
```

## License

This project is part of the SmartBoardAI system.

# SmartBoardAI Python Middleware - Refactored Structure

This document explains the new modular structure of the SmartBoardAI Python middleware after refactoring.

## **New Directory Structure**

```
app/
├── main.py                 # FastAPI app setup and legacy endpoints
├── config.py              # Configuration (unchanged)
├── models.py              # Pydantic models (unchanged)
├── logging_config.py      # Logging configuration (unchanged)
├── prompts/               # NEW: Prompt management module
│   ├── __init__.py
│   ├── system_prompts.py  # All system prompts
│   ├── templates.py       # Prompt templates and builders
│   └── constants.py       # Prompt-related constants
├── routes/                # NEW: Route modules
│   ├── __init__.py
│   ├── ai.py             # AI chat endpoints
│   ├── projects.py       # Project planning endpoints
│   └── health.py         # Health check endpoint
├── services/              # Enhanced: Service classes
│   ├── __init__.py
│   ├── ai_service.py     # NEW: AI business logic
│   ├── project_service.py # NEW: Project planning logic
│   ├── java_client.py    # Java integration (unchanged)
│   └── together.py       # AI integration (unchanged)
└── utils/                 # NEW: Utility functions
    ├── __init__.py
    └── error_handlers.py  # Centralized error handling
```

## **Key Improvements**

### **1. Prompt Management (`app/prompts/`)**

**Before**: Hardcoded prompts scattered throughout `main.py`
**After**: Centralized prompt management

```python
# Easy to modify prompts without touching business logic
from app.prompts.system_prompts import SystemPrompts
from app.prompts.templates import PromptTemplates

# Use prompts
system_prompt = SystemPrompts.PROJECT_STEPS_GENERATION
context = PromptTemplates.build_context_prompt(user, project, user_id, project_id)
```

**Benefits for Frontend Developers**:
- **Easy Customization**: Change AI behavior by modifying prompt files
- **Version Control**: Track prompt changes separately
- **A/B Testing**: Test different prompts easily
- **Internationalization**: Add multiple language support

### **2. Modular Routes (`app/routes/`)**

**Before**: 554-line monolithic `main.py`
**After**: Focused route files

```python
# Each route file handles one concern
app/routes/ai.py          # AI chat endpoints
app/routes/projects.py    # Project planning endpoints  
app/routes/health.py      # Health check endpoint
```

**Benefits**:
- **Single Responsibility**: Each file has one purpose
- **Easier Navigation**: Find relevant code quickly
- **Parallel Development**: Multiple developers can work simultaneously
- **Smaller Files**: Easier to understand and maintain

### **3. Service Classes (`app/services/`)**

**Before**: Business logic mixed with API routes
**After**: Dedicated service classes

```python
# Clean separation of concerns
class AIService:
    async def generate_chat_response(self, user_id, project_id, message):
        # AI business logic here
        
class ProjectService:
    async def generate_project_steps(self, user_id, project_id, description):
        # Project planning logic here
```

**Benefits**:
- **Testability**: Services can be unit tested independently
- **Reusability**: Business logic can be reused across endpoints
- **Maintainability**: Changes to business logic don't affect API structure
- **Dependency Injection**: Easy to mock for testing

### **4. Centralized Error Handling (`app/utils/`)**

**Before**: Repetitive error handling in each endpoint
**After**: Centralized error handling utilities

```python
from app.utils.error_handlers import ErrorHandler

# Consistent error handling across all endpoints
except JavaAuthError as e:
    raise ErrorHandler.handle_java_error(e)
except Exception as e:
    raise ErrorHandler.handle_generic_error(e, "in endpoint_name")
```

**Benefits**:
- **Consistency**: Same error handling patterns everywhere
- **Maintainability**: Update error handling in one place
- **DRY Principle**: Don't repeat error handling code

## **API Endpoints**

### **New Modular Endpoints**
- `GET /api/health/` - Health check
- `POST /api/ai/prompt` - AI chat
- `POST /api/ai/debug/test-ai` - Debug AI
- `POST /api/projects/generate-steps` - Generate project steps
- `POST /api/projects/generate_plan` - Generate tasks

### **Legacy Endpoints (Backward Compatibility)**
- `GET /health` - Health check
- `POST /prompt` - AI chat
- `POST /debug/test-ai` - Debug AI
- `POST /projects/generate-steps` - Generate project steps
- `POST /generate_plan` - Generate tasks

## **How to Customize AI Behavior**

### **1. Modify System Prompts**

Edit `app/prompts/system_prompts.py`:

```python
class SystemPrompts:
    PROJECT_STEPS_GENERATION = """Your custom prompt here..."""
    
    TASK_GENERATION_TEMPLATE = """Your custom task prompt with {placeholders}..."""
```

### **2. Add New Prompt Types**

Add new prompts to `system_prompts.py`:

```python
class SystemPrompts:
    CUSTOM_PROMPT = """Your new prompt..."""
```

### **3. Modify Prompt Templates**

Edit `app/prompts/templates.py`:

```python
class PromptTemplates:
    @staticmethod
    def build_custom_prompt(data):
        return f"Custom prompt with {data}"
```

### **4. Add New Constants**

Edit `app/prompts/constants.py`:

```python
class PromptConstants:
    NEW_CONSTANT = "value"
```

## **Frontend Integration**

### **Easy Prompt Customization**

Frontend developers can now easily customize AI behavior:

1. **Modify Prompts**: Edit files in `app/prompts/`
2. **Add New Features**: Create new service methods
3. **Customize Responses**: Modify response parsing logic
4. **Add Validation**: Update models in `app/models.py`

### **Configuration-Driven Behavior**

Use environment variables for AI behavior:

```bash
# AI Configuration
TOGETHER_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
DEFAULT_TEMPERATURE=0.2
DEFAULT_MAX_TOKENS=512
```

## **Testing**

### **Unit Testing Services**

```python
# Test services independently
def test_ai_service():
    ai_service = AIService()
    # Mock dependencies and test business logic
    
def test_project_service():
    project_service = ProjectService()
    # Test project planning logic
```

### **Integration Testing Routes**

```python
# Test API endpoints
def test_ai_endpoints():
    # Test /api/ai/prompt endpoint
    
def test_project_endpoints():
    # Test /api/projects/generate-steps endpoint
```

## **Migration Guide**

### **For Existing Code**

1. **Import Changes**: Update imports to use new modules
2. **Service Usage**: Use service classes instead of direct AI calls
3. **Error Handling**: Use centralized error handlers

### **For New Features**

1. **Add Prompts**: Create new prompts in `app/prompts/`
2. **Add Services**: Create new service classes in `app/services/`
3. **Add Routes**: Create new route files in `app/routes/`

## **Benefits Summary**

### **For Frontend Developers**
- ✅ **Easy Prompt Modification**: Change AI behavior without touching business logic
- ✅ **Clear API Structure**: Logical endpoint organization
- ✅ **Better Documentation**: Self-documenting code structure
- ✅ **Configuration Options**: Easy to adjust AI parameters

### **For Backend Developers**
- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Testability**: Services can be unit tested independently
- ✅ **Maintainability**: Smaller, focused files
- ✅ **Reusability**: Business logic can be reused across endpoints

### **For DevOps**
- ✅ **Easier Deployment**: Modular structure is easier to containerize
- ✅ **Better Monitoring**: Clear service boundaries for monitoring
- ✅ **Scalability**: Services can be scaled independently

This refactored structure makes the SmartBoardAI Python middleware much more maintainable and easier for frontend developers to work with!

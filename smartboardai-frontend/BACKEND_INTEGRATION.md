# Backend Integration Guide

This document explains how the frontend has been integrated with the backend services.

## Environment Variables

Create a `.env` file in the frontend root directory with the following variables:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# AI Service Configuration  
VITE_AI_API_BASE_URL=http://localhost:8000
```

## Backend Services

### Java Spring Boot API (Port 8080)
- **Base URL**: `http://localhost:8080/api`
- **Purpose**: Kanban board and task management
- **Endpoints**: 
  - `/board` - Board CRUD operations
  - `/board/items` - Task CRUD operations

### Python FastAPI AI Service (Port 8000)
- **Base URL**: `http://localhost:8000`
- **Purpose**: AI chat and project step generation
- **Endpoints**:
  - `/health` - Health check
  - `/prompt` - AI chat responses
  - `/projects/generate-steps` - Generate project tasks

## Features Implemented

### ✅ Backend URL Configuration
- Frontend knows where the backend lives via environment variables
- Default URLs point to localhost development servers
- Easy to configure for different environments

### ✅ AI Page Integration
- Chat page sends user messages to Python AI service
- Real AI responses instead of mock data
- Friendly error messages for connection issues

### ✅ Board Page CRUD Operations
- Load existing tasks from Java backend
- Add new tasks with full form
- Edit existing tasks inline
- Delete tasks with confirmation
- Drag-and-drop status changes
- Import AI-generated tasks

### ✅ AI Task Import
- AI can generate project steps from descriptions
- One-click import to board
- Tasks created with proper priority and descriptions

### ✅ Error Handling
- Connection error messages
- Timeout handling
- Rate limit notifications
- Graceful fallbacks

## Running the Application

1. **Start Java Backend**:
   ```bash
   cd smartboard-api
   ./mvnw spring-boot:run
   ```

2. **Start Python AI Service**:
   ```bash
   cd smartboardai-python
   python -m app.main
   ```

3. **Start Frontend**:
   ```bash
   cd smartboardai-frontend
   npm run dev
   ```

## Testing the Integration

1. **AI Chat**: Go to `/chat` and ask about a project
2. **Board Management**: Go to `/board` to see tasks
3. **Task Import**: Generate tasks in chat, then import to board
4. **Error Handling**: Stop a backend service to see error messages

## API Endpoints Used

### Java Backend
- `GET /api/board` - Get all boards
- `POST /api/board` - Create board
- `GET /api/board/items?boardId={id}` - Get tasks by board
- `POST /api/board/items` - Create task
- `PUT /api/board/items/{id}` - Update task
- `PATCH /api/board/items/{id}/status` - Update task status
- `DELETE /api/board/items/{id}` - Delete task

### Python AI Service
- `GET /health` - Health check
- `POST /prompt` - AI chat
- `POST /projects/generate-steps` - Generate project tasks

## Troubleshooting

**"Couldn't connect to AI service"**: Make sure Python AI service is running on port 8000

**"Failed to load board"**: Make sure Java backend is running on port 8080

**CORS errors**: Backend services should have CORS enabled for localhost:5173 (Vite dev server)

**Environment variables not working**: Make sure `.env` file is in frontend root directory

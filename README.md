# SmartBoardAI

An intelligent project planning assistant that transforms ideas into actionable tasks through AI-powered collaboration. SmartBoard AI combines a modern React frontend, robust Java backend, and AI-powered services to deliver seamless project management with smart task generation.

## ✨ Features

- **🎯 Smart Task Management**: Create, edit, delete, and organize tasks with intuitive Kanban board
- **🤖 AI-Powered Planning**: Generate project tasks and get intelligent suggestions through AI chat
- **🔐 Secure Authentication**: Complete user authentication with login, signup, and logout
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-time Updates**: Live task updates across the board interface
- **🎨 Modern UI**: Clean, intuitive interface built with React and TypeScript

## 🏗️ Architecture

### **Three-Tier Microservices Architecture:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │────│ Java Backend    │────│ Python AI       │
│  (Port 3000)    │    │ (Port 8080)     │    │ Service         │
│                 │    │                 │    │ (Port 8000)     │
│ • Kanban Board  │    │ • REST API      │    │ • AI Chat       │
│ • AI Chat UI    │    │ • Authentication│    │ • Task Gen      │
│ • User Auth     │    │ • Task CRUD     │    │ • Planning      │
│                 │    │ • H2 Database   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow:**
1. **User Interface**: React app provides intuitive Kanban board and AI chat interface
2. **API Gateway**: Java Spring Boot handles authentication, task CRUD, and business logic
3. **AI Integration**: Python FastAPI service processes AI requests and generates intelligent responses
4. **Data Persistence**: H2 in-memory database with automatic seeding for development

### **Technology Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Spring Boot 3 + Java 17 + Spring Security + H2 Database
- **AI Service**: Python 3.8+ + FastAPI + AI Integration
- **Build Tools**: Maven (Java), npm (React), pip (Python)


## 🚀 Quick Start

### **Prerequisites**
- **Java 17+** (for Spring Boot backend)
- **Python 3.8+** (for AI service)  
- **Node.js 16+** & npm (for React frontend)
- **Git** (for version control)

### **One-Command Setup**
```bash
# Clone the repository
git clone https://github.com/Green-Depaul/SmartBoardAI.git
cd SmartBoardAI

# Setup all dependencies
./setup.sh

# Start all services
./start-all.sh
```

**🌐 Access the application at: http://localhost:3000**

### **Alternative: Manual Setup**

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. Java Backend
```bash
cd smartboard-api
./mvnw clean compile
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

#### 2. Python AI Service
```bash
cd smartboardai-python
python3 -m venv ai_venv
source ai_venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Runs on http://localhost:8000
```

#### 3. React Frontend
```bash
cd smartboardai-frontend
npm install
npm run dev
# Runs on http://localhost:3000
```
</details>

## 📋 Available Scripts

| Script | Description | Port | Usage |
|--------|-------------|------|-------|
| `./setup.sh` | Install all dependencies | - | Run once initially |
| `./start-all.sh` | Start all services | 3000, 8080, 8000 | Main startup script |
| `./stop-all.sh` | Stop all services | - | Cleanup script |
| `./start-backend.sh` | Java backend only | 8080 | Backend development |
| `./start-ai-service.sh` | Python AI service only | 8000 | AI development |
| `./start-frontend.sh` | React frontend only | 3000 | Frontend development |

## 🌐 Service Endpoints

| Service | URL | Health Check | Description |
|---------|-----|--------------|-------------|
| **Frontend** | http://localhost:3000 | http://localhost:3000 | React UI (main interface) |
| **Java Backend** | http://localhost:8080 | http://localhost:8080/actuator/health | REST API & Database |
| **Python AI** | http://localhost:8000 | http://localhost:8000/api/health | AI Chat & Task Generation |

## 📁 Project Structure

```
SmartBoardAI/
├── smartboard-api/           # Java Spring Boot Backend (Port 8080)
│   ├── src/main/java/        # Java source code
│   ├── src/main/resources/   # Configuration files
│   ├── pom.xml              # Maven dependencies
│   └── mvnw                 # Maven wrapper
├── smartboardai-python/      # Python AI Service (Port 8000)
│   ├── app/                 # Python application code
│   ├── requirements.txt     # Python dependencies
│   └── ai_venv/            # Virtual environment (auto-created)
├── smartboardai-frontend/    # React Frontend (Port 3000)
│   ├── src/                 # React source code
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── logs/                    # Service logs (auto-created)
├── DEPLOYMENT_GUIDE.md      # Comprehensive deployment documentation
└── *.sh                     # Automated deployment scripts
```


## 🔐 Authentication & Demo

### **Development Login**
The application includes pre-seeded demo users for immediate testing:

- **Email**: `demo@smartboard.ai`
- **Password**: `demo1234`

### **Database Access (Development)**
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:smartboard`
- **Username**: `sa`
- **Password**: *(empty)*

### **Features Available**
- ✅ **User Registration & Login**
- ✅ **Task Creation, Editing & Deletion**
- ✅ **Kanban Board with Drag-and-Drop**
- ✅ **AI-Powered Task Generation**
- ✅ **Project Planning Chat Interface**
- ✅ **Real-time Task Updates**

## 🛠️ Development Workflow

### **Full-Stack Development**
```bash
./start-all.sh    # Start all services
# Develop in your IDE
./stop-all.sh     # Stop when done
```

### **Individual Service Development**
```bash
# Backend only
./start-backend.sh

# AI service only  
./start-ai-service.sh

# Frontend only (requires backend)
./start-backend.sh && ./start-frontend.sh
```

### **Monitoring & Debugging**
```bash
# View logs in real-time
tail -f logs/*.log

# Check service health
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8000/api/health       # AI Service
curl http://localhost:3000                  # Frontend
```

## 🚨 Troubleshooting

### **Common Issues**

**Permission Denied on Scripts:**
```bash
chmod +x *.sh
```

**Port Already in Use:**
```bash
./stop-all.sh  # Or manually:
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # AI Service  
lsof -ti:8080 | xargs kill -9  # Backend
```

**Java Issues:**
- Ensure Java 17+ is installed: `java -version`
- Check JAVA_HOME environment variable

**Python Issues:**
- Ensure Python 3.8+ is installed: `python3 --version`
- Delete `ai_venv` folder and re-run setup if needed

**Node.js Issues:**
- Ensure Node.js 16+ is installed: `node --version`
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and re-run setup

## 📖 Documentation

- **📋 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Comprehensive setup and deployment guide
- **🔧 [API Documentation](./smartboard-api/KANBAN_API_DOCUMENTATION.md)** - Backend API reference
- **🔒 [Security Documentation](./SECURITY.md)** - Security guidelines and best practices

## 🤝 Contributing

This project is ready for development and deployment. Key areas for contribution:
- Feature enhancements to the Kanban board
- AI model improvements and integrations  
- UI/UX design improvements
- Performance optimizations
- Additional authentication providers

## 📝 License

Academic/Capstone project - DePaul University CSC 394


## API contracts (proposed)

Frontend → Java (public):
- POST `/api/ai/suggest-tasks`
	- Req: `{ projectDescription: string, context?: {...} }`
	- Res: `{ tasks: Array<{ id: string, title: string, description?: string, priority?: "low"|"medium"|"high" }> }`

- POST `/api/ai/chat` (or SSE `/api/ai/chat/stream`)
	- Req: `{ messages: Array<{ role: "user"|"assistant"|"system", content: string }>, sessionId?: string }`
	- Res (non-stream): `{ message: { role: "assistant", content: string } }`
	- Res (stream): `text/event-stream` chunks of `data: ...` ending with `data: [DONE]`

Java → Python (internal):
- POST `/prompt` — generic chat completion
- POST `/projects/generate-steps` — specialized steps generation returning structured JSON


## Frontend notes

- Tech: React 18 + TypeScript, Vite, utility-first CSS (Tailwind v4 build output in `index.css`)
- Pages: Landing, Login, Signup, Chat, Kanban
- Current navigation uses local state in `src/App.tsx` (no URL routing). We can optionally move to React Router for deep links.
- For dev, point fetches to `http://localhost:8080/api/...` (configure proxy if desired)


## Backend notes (Java)

- Spring Boot 3.5.x, Java 17
- Add a controller `AiController` exposing `/api/ai/*` endpoints
- Use `WebClient` to call the Python adapter at `http://localhost:8081` (configurable)
- Add CORS for `http://localhost:3000` during dev
- Consider Resilience4j for retries/timeouts and SLF4J for structured logs


## AI adapter notes (Python)

- FastAPI with CORS enabled
- Reads Together.ai settings from env via `app/config.py`
- Services: `app/services/java_client.py` (calls Java) and `app/services/together.py` (calls AI)
- Endpoints: `/health`, `/prompt`, `/projects/generate-steps`


## Development workflow

1) Run all three services locally (frontend 3000, Java 8080, Python 8081)
2) Build UI changes in `smartboardai-frontend/` (HMR via Vite)
3) Add/modify Java endpoints and DTOs in `smartboard-api/`
4) Modify prompts/provider settings in `smartboardai-python/`
5) Keep contracts stable; add integration tests at Java boundary


## Troubleshooting

- CORS errors: ensure Java allows `http://localhost:3000`, and Python’s `CORS_ORIGINS` includes it
- 401/403 from AI: verify `TOGETHER_API_KEY`
- Timeouts: check Python adapter is up on 8081 and Java’s `JAVA_BASE_URL` env in Python points to 8080
- Port conflicts: Vite shows the dev URL; use that


## License

For academic/capstone use. Add license terms as needed.

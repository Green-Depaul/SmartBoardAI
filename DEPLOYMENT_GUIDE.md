# SmartBoard AI - Project Setup and Deployment Guide

## 🚀 Quick Start

### Prerequisites
- **Java 17+** (for Spring Boot backend)
- **Python 3.8+** (for AI service)
- **Node.js 16+** & npm (for React frontend)
- **Git** (for version control)

### One-Command Setup & Start
```bash
# Clone the repository
git clone https://github.com/Green-Depaul/SmartBoardAI.git
cd SmartBoardAI

# Setup all dependencies
./setup.sh

# Start all services
./start-all.sh
```

Access the application at: **http://localhost:3000**

---

## 📋 Available Scripts

### Main Scripts
| Script | Description | Usage |
|--------|-------------|-------|
| `./setup.sh` | Install all dependencies and prepare project | Run once initially |
| `./start-all.sh` | Start all services (Backend + AI + Frontend) | Main startup script |
| `./stop-all.sh` | Stop all running services | Cleanup script |

### Individual Service Scripts
| Script | Description | Port | Usage |
|--------|-------------|------|-------|
| `./start-backend.sh` | Java Spring Boot backend only | 8080 | Backend development |
| `./start-ai-service.sh` | Python AI service only | 8000 | AI service development |
| `./start-frontend.sh` | React frontend only | 3000 | Frontend development |

---

## 🏗️ Project Architecture

```
SmartBoard AI
├── smartboard-api/          # Java Spring Boot Backend (Port 8080)
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Configuration files
│   ├── pom.xml             # Maven dependencies
│   └── mvnw                # Maven wrapper
├── smartboardai-python/     # Python AI Service (Port 8000)
│   ├── app/                # Python application code
│   ├── requirements.txt    # Python dependencies
│   └── ai_venv/           # Virtual environment (created by setup)
├── smartboardai-frontend/   # React Frontend (Port 3000)
│   ├── src/                # React source code
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
└── logs/                   # Service logs (created by scripts)
```

---

## 🔧 Manual Setup (Alternative)

If you prefer to set up services manually:

### 1. Java Backend Setup
```bash
cd smartboard-api
./mvnw clean compile
./mvnw spring-boot:run
```

### 2. Python AI Service Setup
```bash
cd smartboardai-python
python3 -m venv ai_venv
source ai_venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. React Frontend Setup
```bash
cd smartboardai-frontend
npm install
npm run dev
```

---

## 🌐 Service Endpoints

### Frontend (React)
- **URL**: http://localhost:3000
- **Description**: Main user interface
- **Features**: Kanban board, AI chat, authentication

### Backend API (Spring Boot)
- **URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **API Base**: http://localhost:8080/api
- **Features**: Task CRUD, user management, security

### AI Service (Python)
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health
- **API Base**: http://localhost:8000/api
- **Features**: AI task generation, project planning

---

## 📊 Monitoring & Logs

### Log Files (when using start-all.sh)
- `logs/backend.log` - Java Backend logs
- `logs/ai-service.log` - Python AI Service logs  
- `logs/frontend.log` - React Frontend logs

### Real-time Monitoring
```bash
# Watch all logs in real-time
tail -f logs/*.log

# Watch specific service
tail -f logs/backend.log
```

### Health Checks
```bash
# Check all services
curl http://localhost:8080/actuator/health  # Backend
curl http://localhost:8000/api/health       # AI Service
curl http://localhost:3000                  # Frontend
```

---

## 🛠️ Development Workflow

### For Full-Stack Development
```bash
./start-all.sh  # Start all services
# Develop in your IDE
./stop-all.sh   # Stop when done
```

### For Backend-Only Development
```bash
./start-backend.sh
# Backend available at http://localhost:8080
```

### For Frontend-Only Development
```bash
./start-backend.sh    # Start backend for API calls
./start-frontend.sh   # In another terminal
# Frontend available at http://localhost:3000
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # AI Service
lsof -ti:8080 | xargs kill -9  # Backend

# Or use the stop script
./stop-all.sh
```

### Permission Denied on Scripts
```bash
chmod +x *.sh
```

### Java Issues
- Ensure Java 17+ is installed: `java -version`
- Check JAVA_HOME environment variable

### Python Issues
- Ensure Python 3.8+ is installed: `python3 --version`
- Virtual environment issues: delete `ai_venv` folder and re-run setup

### Node.js Issues
- Ensure Node.js 16+ is installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and re-run setup

---

## 📝 Features

### ✅ Implemented Features
- **Authentication**: Login, signup, logout
- **Task Management**: Create, read, update, delete tasks
- **Kanban Board**: Drag-and-drop task organization
- **AI Integration**: AI-powered task generation and project planning
- **Real-time Updates**: Live task updates across the board
- **Responsive Design**: Works on desktop and mobile

### 🔐 Default Users (Development)
The application includes seeded development users for testing.

---

## 🚀 Deployment Notes

### Environment Variables
- Development: Uses default configurations
- Production: Update configuration files with production settings

### Database
- Development: H2 in-memory database (auto-configured)
- Production: Configure external database in `application.properties`

### Security
- Development: CORS enabled for localhost
- Production: Update CORS and security configurations

---

## 📞 Support

If you encounter issues:
1. Check the logs in the `logs/` directory
2. Verify all prerequisites are installed
3. Try the manual setup process
4. Check port availability with `lsof -i :PORT`

---

**Happy Coding! 🎉**
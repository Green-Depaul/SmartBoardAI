#!/bin/bash

# SmartBoard AI - Complete Project Startup Script
# This script starts all three services: Java Backend, Python AI Service, and React Frontend

echo "🚀 Starting SmartBoard AI Project..."
echo "=================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Attempting to stop existing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo "❌ $service_name failed to start within expected time"
    return 1
}

# Check required ports and kill existing processes if needed
echo "🔍 Checking ports..."
check_port 8080  # Java Backend
check_port 8000  # Python AI Service
check_port 3000  # React Frontend

# Start Java Backend
echo ""
echo "1️⃣ Starting Java Backend (Spring Boot)..."
echo "========================================="
cd smartboard-api
if [ ! -f "target/classes" ]; then
    echo "📦 Building Java project..."
    ./mvnw clean compile
fi

echo "🟢 Starting Java Backend on port 8080..."
./mvnw spring-boot:run > ../logs/backend.log 2>&1 &
JAVA_PID=$!
echo "Java Backend PID: $JAVA_PID"
cd ..

# Start Python AI Service
echo ""
echo "2️⃣ Starting Python AI Service..."
echo "================================="
cd smartboardai-python

# Create virtual environment if it doesn't exist
if [ ! -d "ai_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv ai_venv
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
source ai_venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

echo "🟡 Starting Python AI Service on port 8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../logs/ai-service.log 2>&1 &
PYTHON_PID=$!
echo "Python AI Service PID: $PYTHON_PID"
cd ..

# Wait for backend services to be ready
wait_for_service "http://localhost:8080/actuator/health" "Java Backend"
wait_for_service "http://localhost:8000/api/health" "Python AI Service"

# Start React Frontend
echo ""
echo "3️⃣ Starting React Frontend..."
echo "============================="
cd smartboardai-frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🔵 Starting React Frontend on port 3000..."
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "React Frontend PID: $FRONTEND_PID"
cd ..

# Wait for frontend to be ready
sleep 5
echo ""
echo "🎉 All services started successfully!"
echo "===================================="
echo ""
echo "📋 Service Status:"
echo "  🟢 Java Backend:     http://localhost:8080"
echo "  🟡 Python AI:        http://localhost:8000"
echo "  🔵 React Frontend:    http://localhost:3000"
echo ""
echo "📁 Logs are available in the 'logs' directory:"
echo "  • logs/backend.log    - Java Backend logs"
echo "  • logs/ai-service.log - Python AI Service logs"
echo "  • logs/frontend.log   - React Frontend logs"
echo ""
echo "🛑 To stop all services, run: ./stop-all.sh"
echo ""
echo "Process IDs:"
echo "  Java Backend: $JAVA_PID"
echo "  Python AI:    $PYTHON_PID"
echo "  React Frontend: $FRONTEND_PID"

# Save PIDs for stop script
mkdir -p .pids
echo $JAVA_PID > .pids/backend.pid
echo $PYTHON_PID > .pids/ai-service.pid
echo $FRONTEND_PID > .pids/frontend.pid

echo ""
echo "✨ SmartBoard AI is now running! Open http://localhost:3000 in your browser."
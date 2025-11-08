#!/bin/bash

# SmartBoard AI - Stop All Services Script
# This script stops all running services and cleans up processes

echo "🛑 Stopping SmartBoard AI Services..."
echo "===================================="

# Function to stop a service by PID
stop_service() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "🔴 Stopping $service_name (PID: $pid)..."
            kill -TERM $pid 2>/dev/null
            sleep 3
            if kill -0 $pid 2>/dev/null; then
                echo "   Force killing $service_name..."
                kill -9 $pid 2>/dev/null
            fi
            echo "✅ $service_name stopped"
        else
            echo "ℹ️  $service_name was not running"
        fi
        rm -f "$pid_file"
    else
        echo "ℹ️  No PID file found for $service_name"
    fi
}

# Stop services using PID files
if [ -d ".pids" ]; then
    stop_service ".pids/frontend.pid" "React Frontend"
    stop_service ".pids/ai-service.pid" "Python AI Service"
    stop_service ".pids/backend.pid" "Java Backend"
    rmdir .pids 2>/dev/null
fi

# Force kill any remaining processes on the ports
echo ""
echo "🧹 Cleaning up any remaining processes..."

# Kill processes on specific ports
for port in 3000 8000 8080; do
    pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔴 Killing processes on port $port..."
        echo $pids | xargs kill -9 2>/dev/null
    fi
done

# Kill any remaining SmartBoard processes
pkill -f "smartboard" 2>/dev/null
pkill -f "mvnw" 2>/dev/null
pkill -f "uvicorn.*app.main" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo ""
echo "✅ All SmartBoard AI services have been stopped!"
echo ""
echo "📋 To start services again, run: ./start-all.sh"
#!/bin/bash

# SmartBoard AI - Frontend Only Script
# Starts just the React frontend development server

echo "🔵 Starting SmartBoard React Frontend..."
echo "======================================="

# Check if port 3000 is in use
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Stopping existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

cd smartboardai-frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting React Frontend on port 3000..."
npm run dev

echo "✅ React Frontend stopped."
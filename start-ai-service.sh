#!/bin/bash

# SmartBoard AI - AI Service Only Script
# Starts just the Python AI service

echo "🟡 Starting SmartBoard Python AI Service..."
echo "==========================================="

# Check if port 8000 is in use
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use. Stopping existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

cd smartboardai-python

# Create virtual environment if it doesn't exist
if [ ! -d "ai_venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv ai_venv
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
source ai_venv/bin/activate
pip install -r requirements.txt

echo "🚀 Starting Python AI Service on port 8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo "✅ Python AI Service stopped."
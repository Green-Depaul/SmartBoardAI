#!/bin/bash

# SmartBoard AI - Setup Script
# This script installs all necessary dependencies and prepares the project for running

echo "⚙️  Setting up SmartBoard AI Project..."
echo "====================================="

# Check system requirements
echo "🔍 Checking system requirements..."

# Check Java
if command -v java &> /dev/null; then
    java_version=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
    echo "✅ Java found: $java_version"
else
    echo "❌ Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    maven_version=$(mvn -version | head -n 1)
    echo "✅ Maven found: $maven_version"
else
    echo "ℹ️  Maven not found globally, but project includes Maven wrapper (mvnw)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    echo "✅ Python found: $python_version"
else
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js found: $node_version"
else
    echo "❌ Node.js not found. Please install Node.js 16 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✅ npm found: v$npm_version"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."

# Create logs directory
mkdir -p logs

# Setup Java Backend
echo "1️⃣ Setting up Java Backend..."
cd smartboard-api
echo "   📥 Downloading Java dependencies..."
./mvnw dependency:go-offline -q
echo "   🔨 Compiling Java project..."
./mvnw compile -q
echo "   ✅ Java Backend setup complete"
cd ..

# Setup Python AI Service
echo ""
echo "2️⃣ Setting up Python AI Service..."
cd smartboardai-python
echo "   🐍 Creating Python virtual environment..."
python3 -m venv ai_venv
echo "   📥 Installing Python dependencies..."
source ai_venv/bin/activate
pip install -r requirements.txt --quiet
echo "   ✅ Python AI Service setup complete"
cd ..

# Setup React Frontend
echo ""
echo "3️⃣ Setting up React Frontend..."
cd smartboardai-frontend
echo "   📥 Installing Node.js dependencies..."
npm install --silent
echo "   ✅ React Frontend setup complete"
cd ..

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x start-all.sh
chmod +x stop-all.sh
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x start-ai-service.sh

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "📋 Available scripts:"
echo "  • ./start-all.sh      - Start all services"
echo "  • ./stop-all.sh       - Stop all services"
echo "  • ./start-backend.sh  - Start Java Backend only"
echo "  • ./start-frontend.sh - Start React Frontend only"
echo "  • ./start-ai-service.sh - Start Python AI Service only"
echo ""
echo "🚀 To start the complete application, run:"
echo "   ./start-all.sh"
echo ""
echo "🌐 Once started, access the application at:"
echo "   http://localhost:3000"
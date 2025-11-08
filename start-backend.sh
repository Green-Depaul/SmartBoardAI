#!/bin/bash

# SmartBoard AI - Backend Only Script
# Starts just the Java Spring Boot backend service

echo "🟢 Starting SmartBoard Java Backend..."
echo "====================================="

# Check if port 8080 is in use
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "⚠️  Port 8080 is already in use. Stopping existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

cd smartboard-api

# Build if necessary
if [ ! -f "target/classes" ]; then
    echo "📦 Building Java project..."
    ./mvnw clean compile
fi

echo "🚀 Starting Java Backend on port 8080..."
./mvnw spring-boot:run

echo "✅ Java Backend stopped."
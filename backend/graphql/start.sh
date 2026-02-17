#!/bin/bash

# Quick start script for GraphQL API
# This script installs dependencies and starts the GraphQL server

echo "🚀 42c Banking GraphQL API - Quick Start"
echo "========================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend/graphql directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️  Warning: Node.js version 16 or higher is recommended. You have: $(node -v)"
fi

# Check if .env file exists
if [ ! -f "../app/.env" ]; then
    echo "⚠️  Warning: .env file not found in backend/app/"
    echo "📝 Please ensure environment variables are configured."
    echo "   You can copy .env.example to backend/app/.env and update the values."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🎯 Starting GraphQL server..."
echo "   - HTTP:  http://localhost:4000/graphql"
echo "   - HTTPS: https://localhost:4443/graphql"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev

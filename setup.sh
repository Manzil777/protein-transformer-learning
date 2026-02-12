#!/bin/bash

# Portability Setup Script
# Installs Python backend and Node.js frontend dependencies.

echo "🚀 Starting Project Setup..."

# 1. Backend Setup
echo "--------------------------------------------------"
echo "📦 Setting up Backend (Python)..."
echo "--------------------------------------------------"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists."
fi

# Activate venv
source venv/bin/activate

# Upgrade pip and install requirements
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend dependencies installed."

# 2. Frontend Setup
echo "--------------------------------------------------"
echo "🎨 Setting up Frontend (Node.js)..."
echo "--------------------------------------------------"

cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node modules..."
    npm install
else
    echo "Node modules already present. Run 'npm install' manually if you have issues."
fi

cd ..

echo "--------------------------------------------------"
echo "🎉 Setup Complete!"
echo "--------------------------------------------------"
echo "To run the project, use: ./run.sh"

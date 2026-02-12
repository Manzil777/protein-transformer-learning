#!/bin/bash

# Portability Run Script
# Starts both the Flask backend and React frontend concurrently.

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT)
trap cleanup SIGINT

echo "🚀 Launching Project..."

# 1. Start Backend
echo "--------------------------------------------------"
echo "🐍 Starting Flask Backend (Port 5000)..."
echo "--------------------------------------------------"
source venv/bin/activate
python app.py &
BACKEND_PID=$!

# 2. Start Frontend
echo "--------------------------------------------------"
echo "⚛️  Starting React Frontend..."
echo "--------------------------------------------------"
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo "--------------------------------------------------"
echo "✅ Both servers are running!"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo "--------------------------------------------------"
echo "Press Ctrl+C to stop both servers."

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

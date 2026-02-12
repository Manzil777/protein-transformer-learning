@echo off
:: Portability Run Script for Windows
:: Starts both the Flask backend and React frontend concurrently.

echo 🚀 Launching Project...

:: 1. Start Backend in a new window
echo --------------------------------------------------
echo 🐍 Starting Flask Backend (Port 5000)...
echo --------------------------------------------------
start "Flask Backend" cmd /k "call venv\Scripts\activate.bat && python app.py"

:: 2. Start Frontend in a new window
echo --------------------------------------------------
echo ⚛️  Starting React Frontend...
echo --------------------------------------------------
cd frontend
start "React Frontend" cmd /k "npm run dev -- --host"
cd ..

echo --------------------------------------------------
echo ✅ Servers launched in background windows!
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:5173
echo --------------------------------------------------

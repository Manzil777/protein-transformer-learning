@echo off
:: Portability Setup Script for Windows
:: Installs Python backend and Node.js frontend dependencies.

echo 🚀 Starting Project Setup...

:: 1. Backend Setup
echo --------------------------------------------------
echo 📦 Setting up Backend (Python)...
echo --------------------------------------------------

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

:: Activate venv and install deps
call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo ✅ Backend dependencies installed.

:: 2. Frontend Setup
echo --------------------------------------------------
echo 🎨 Setting up Frontend (Node.js)...
echo --------------------------------------------------

cd frontend
if not exist "node_modules" (
    echo Installing Node modules...
    call npm install
) else (
    echo Node modules already present.
)
cd ..

echo --------------------------------------------------
echo 🎉 Setup Complete!
echo --------------------------------------------------
echo To run the project, double-click run.bat
pause

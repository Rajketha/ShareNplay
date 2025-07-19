@echo off
title ShareNPlay - One-Click GitHub Runner
color 0A
echo.
echo ========================================
echo    ShareNPlay - One-Click GitHub Runner
echo ========================================
echo.

REM Check if Git is installed
echo [1/6] Checking Git installation...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)
echo ✓ Git is installed

REM Check if Node.js is installed
echo.
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm is not installed. Please install npm first.
    echo.
    pause
    exit /b 1
)
echo ✓ npm is installed

REM Create a temporary directory for the project
echo.
echo [3/6] Setting up project directory...
set PROJECT_DIR=%TEMP%\ShareNPlay_%RANDOM%
echo Project will be cloned to: %PROJECT_DIR%

REM Clone the repository
echo.
echo [4/6] Cloning ShareNPlay from GitHub...
git clone https://github.com/Rajketha/ShareNPlay.git "%PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo ✗ Failed to clone repository. Please check your internet connection.
    echo.
    pause
    exit /b 1
)
echo ✓ Repository cloned successfully

REM Navigate to project directory
cd /d "%PROJECT_DIR%"

REM Install backend dependencies
echo.
echo [5/6] Installing backend dependencies...
cd backend
npm install --silent
if %errorlevel% neq 0 (
    echo ✗ Failed to install backend dependencies.
    echo.
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install --silent
if %errorlevel% neq 0 (
    echo ✗ Failed to install frontend dependencies.
    echo.
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

REM Navigate back to project root
cd ..

echo.
echo [6/6] Starting ShareNPlay servers...
echo.
echo 🚀 Starting backend server...
start "ShareNPlay Backend" cmd /k "cd /d "%PROJECT_DIR%\backend" && npm start"

echo 🚀 Starting frontend server...
start "ShareNPlay Frontend" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm start"

echo.
echo ========================================
echo           🎮 ShareNPlay Started! 🎮
echo ========================================
echo.
echo ✓ Backend server starting on: http://localhost:5000
echo ✓ Frontend server starting on: http://localhost:3002
echo.
echo 📱 Open your browser and go to: http://localhost:3002
echo.
echo 💡 The servers will open in separate windows.
echo    Close those windows to stop the servers.
echo.
echo 📁 Project location: %PROJECT_DIR%
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start http://localhost:3002

echo.
echo 🌐 Opening ShareNPlay in your browser...
echo.
echo Enjoy your multiplayer gaming experience! 🎮✨
echo.
pause 
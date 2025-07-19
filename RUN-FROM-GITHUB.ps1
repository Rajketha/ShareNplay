# ShareNPlay - One-Click GitHub Runner (PowerShell)
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ShareNPlay - One-Click GitHub Runner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
Write-Host "[1/6] Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git is installed" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "✗ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/downloads" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
Write-Host ""
Write-Host "[2/6] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Node.js is installed" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ npm is installed" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "✗ npm is not installed. Please install npm first." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Create a temporary directory for the project
Write-Host ""
Write-Host "[3/6] Setting up project directory..." -ForegroundColor Yellow
$projectDir = Join-Path $env:TEMP "ShareNPlay_$(Get-Random)"
Write-Host "Project will be cloned to: $projectDir" -ForegroundColor Cyan

# Clone the repository
Write-Host ""
Write-Host "[4/6] Cloning ShareNPlay from GitHub..." -ForegroundColor Yellow
try {
    git clone https://github.com/Rajketha/ShareNPlay.git $projectDir
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Repository cloned successfully" -ForegroundColor Green
    } else {
        throw "Clone failed"
    }
} catch {
    Write-Host "✗ Failed to clone repository. Please check your internet connection." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to project directory
Set-Location $projectDir

# Install backend dependencies
Write-Host ""
Write-Host "[5/6] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"
try {
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        throw "Backend install failed"
    }
} catch {
    Write-Host "✗ Failed to install backend dependencies." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "..\frontend"
try {
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        throw "Frontend install failed"
    }
} catch {
    Write-Host "✗ Failed to install frontend dependencies." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate back to project root
Set-Location ".."

Write-Host ""
Write-Host "[6/6] Starting ShareNPlay servers..." -ForegroundColor Yellow
Write-Host ""

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectDir\backend'; npm start" -WindowStyle Normal

# Start frontend server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectDir\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         🎮 ShareNPlay Started! 🎮" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Backend server starting on: http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend server starting on: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Open your browser and go to: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 The servers will open in separate windows." -ForegroundColor Yellow
Write-Host "   Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Project location: $projectDir" -ForegroundColor Cyan
Write-Host ""

# Wait a moment for servers to start
Write-Host "⏳ Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open the application in default browser
Write-Host "🌐 Opening ShareNPlay in your browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "Enjoy your multiplayer gaming experience! 🎮✨" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit" 
@echo off
echo Starting ShareNPlay Backend and Frontend...
echo.
echo Starting Backend on port 5000...
start "ShareNPlay Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend on port 3000...
start "ShareNPlay Frontend" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause 
@echo off
echo Starting ShareNPlay Backend and Frontend...
echo.

echo Killing any existing Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting Backend on port 5000...
start "ShareNPlay Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend on port 3002...
start "ShareNPlay Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3002
echo Mobile: http://192.168.1.38:3002
echo.
echo Wait for both servers to fully start before testing!
echo.
pause 
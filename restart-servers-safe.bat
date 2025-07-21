@echo off
REM Restart ShareNPlay servers without killing cmd.exe

echo Restarting ShareNPlay servers...
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node.js processes stopped
) else (
    echo No Node.js processes found
)
echo.

echo Starting backend and frontend servers...
call start-both.bat 
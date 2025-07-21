@echo off
echo Killing all ShareNPlay servers...
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node.js processes stopped
) else (
    echo No Node.js processes found
)

echo.
echo Stopping all command prompts...
taskkill /F /IM cmd.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Command prompts stopped
) else (
    echo No command prompts found
)

echo.
echo ✓ All servers killed successfully!
echo You can now run start-both.bat to start fresh servers.
echo.
pause 
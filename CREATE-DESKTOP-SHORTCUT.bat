@echo off
echo Creating Desktop Shortcut for ShareNPlay...
echo.

REM Get the current directory
set CURRENT_DIR=%~dp0
set SHORTCUT_NAME=ShareNPlay - Run from GitHub

REM Get desktop path
for /f "tokens=2*" %%a in ('reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop 2^>nul') do set DESKTOP=%%b

REM Create VBS script to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%DESKTOP%\%SHORTCUT_NAME%.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%CURRENT_DIR%RUN-FROM-GITHUB.bat" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "One-click ShareNPlay runner from GitHub" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.IconLocation = "%CURRENT_DIR%RUN-FROM-GITHUB.bat,0" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"

REM Run the VBS script
cscript //nologo "%TEMP%\CreateShortcut.vbs"

REM Clean up
del "%TEMP%\CreateShortcut.vbs"

echo ✓ Desktop shortcut created successfully!
echo.
echo 📍 Shortcut location: %DESKTOP%\%SHORTCUT_NAME%.lnk
echo.
echo 🎮 Double-click the shortcut to run ShareNPlay from GitHub!
echo.
pause 
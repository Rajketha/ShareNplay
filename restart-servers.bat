@echo off
REM Kill all running Node.js and command prompt processes
call kill-servers.bat

REM Start both backend and frontend servers
call start-both.bat 
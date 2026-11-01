@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\project-server.ps1" -Action stop
set "result=%errorlevel%"
if /I not "%~1"=="--no-pause" pause
exit /b %result%

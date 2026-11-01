@echo off
setlocal
cd /d "%~dp0"
echo Starting EventSaathi with local Ollama for testing...
call "%~dp0stop.bat" --no-pause
if errorlevel 1 exit /b 1
set "AI_PROVIDER=ollama"
if not defined OLLAMA_MODEL set "OLLAMA_MODEL=qwen3-coder:30b"
call "%~dp0run.bat" --no-pause
set "result=%errorlevel%"
echo To return to the default provider, use stop.bat then run.bat.
if /I not "%~1"=="--no-pause" pause
exit /b %result%

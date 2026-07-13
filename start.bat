@echo off
setlocal

cd /d "%~dp0"

start "ATRI Backend" /D "%~dp0" cmd /k ".venv\Scripts\python.exe main.py"
start "ATRI Frontend" /D "%~dp0frontend" cmd /k "npm.cmd run dev"

endlocal
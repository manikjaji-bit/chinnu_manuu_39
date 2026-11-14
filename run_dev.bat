@echo off
title CAMPUS GUARDIAN - Development Mode
echo Starting Campus Guardian in Dual Hot-Reload Development Mode...
echo Backend API: http://localhost:8000
echo Frontend Dev: http://localhost:5173
echo.
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"
start cmd /k "set PATH=%cd%\tools\node;%PATH% && cd frontend && npm run dev"
echo Both servers started!
pause

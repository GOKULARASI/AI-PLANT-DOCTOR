@echo off
title PlantSense AI - Full Stack Launcher
echo ===================================================
echo     PlantSense AI - Multi-Tier AI Plant Doctor
echo ===================================================
echo.

echo [1/3] Starting Python ML Microservice (Port 8000)...
start "PlantSense Python ML" cmd /k "cd /d %~dp0ml && python app.py"

echo [2/3] Starting Node.js Backend Server (Port 5000)...
start "PlantSense Backend" cmd /k "cd /d %~dp0server && node server.js"

echo [3/3] Starting React Client (Port 5173)...
start "PlantSense Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo All services launched!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:5000
echo - Python ML: http://127.0.0.1:8000
echo.
pause

@echo off
echo Starting ProgressPoint Application...
echo.

REM Start Backend Server
echo Starting Backend Server on Port 5001...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend Server
echo Starting Frontend Development Server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
@echo off
echo ==================================================
echo   AI Resume Builder - Starting All Services
echo ==================================================
echo.

REM Kill process on port 5001 (Backend)
echo Cleaning up port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do (
    echo   [✓] Killing process %%a on port 5001
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 5173 (Frontend)
echo Cleaning up port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo   [✓] Killing process %%a on port 5173
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul
echo   [✓] Ports cleaned!
echo.

REM Start Backend
echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm run dev"

timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd Frontend && npm run dev"

echo.
echo ==================================================
echo   [✓] Both servers are starting!
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:5173
echo ==================================================
echo.
echo Two new windows opened with the servers.
echo You can close this window now.
pause

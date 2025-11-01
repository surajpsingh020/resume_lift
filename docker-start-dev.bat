@echo off
echo ================================================
echo   AI Resume Builder - Docker Development Mode
echo ================================================
echo.

echo [1/4] Stopping any running containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/4] Building Docker images...
docker-compose -f docker-compose.dev.yml build

echo.
echo [3/4] Starting containers with hot-reload...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [4/4] Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo ================================================
echo   Status Check
echo ================================================
docker-compose -f docker-compose.dev.yml ps

echo.
echo ================================================
echo   Application URLs
echo ================================================
echo   Frontend: http://localhost:5173 (Vite)
echo   Backend:  http://localhost:5001
echo   MongoDB:  mongodb://localhost:27017
echo ================================================
echo.
echo Hot-reload is ENABLED for both Frontend and Backend
echo.
echo Run 'docker-compose -f docker-compose.dev.yml logs -f' to view logs
echo Run 'docker-compose -f docker-compose.dev.yml down' to stop
pause

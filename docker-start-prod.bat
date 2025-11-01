@echo off
echo ================================================
echo   AI Resume Builder - Docker Production Build
echo ================================================
echo.

echo [1/4] Stopping any running containers...
docker-compose down

echo.
echo [2/4] Building Docker images...
docker-compose build --no-cache

echo.
echo [3/4] Starting containers in detached mode...
docker-compose up -d

echo.
echo [4/4] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo ================================================
echo   Status Check
echo ================================================
docker-compose ps

echo.
echo ================================================
echo   Application URLs
echo ================================================
echo   Frontend: http://localhost
echo   Backend:  http://localhost:5001
echo   MongoDB:  mongodb://localhost:27017
echo ================================================
echo.
echo Run 'docker-compose logs -f' to view logs
echo Run 'docker-compose down' to stop all services
pause

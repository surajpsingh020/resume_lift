@echo off
echo ================================================
echo   AI Resume Builder - Docker Cleanup
echo ================================================
echo.

echo Stopping and removing all containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down

echo.
echo Do you want to remove volumes (database data)? (y/N)
set /p choice=

if /i "%choice%"=="y" (
    echo.
    echo Removing volumes...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    echo All volumes removed!
) else (
    echo Volumes preserved.
)

echo.
echo Cleanup complete!
pause

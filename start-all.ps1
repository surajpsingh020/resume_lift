# AI Resume Builder - Master Startup Script
# Automatically cleans up ports and starts both servers

Write-Host "=================================================="
Write-Host "  AI Resume Builder - Starting All Services"
Write-Host "=================================================="
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill processes on both ports
Write-Host "Cleaning up ports 5001 and 5173..."

# Backend port 5001
$backendConnection = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($backendConnection) {
    $processId = $backendConnection.OwningProcess
    Write-Host "  [OK] Stopping process $processId on port 5001"
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Frontend port 5173
$frontendConnection = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendConnection) {
    $processId = $frontendConnection.OwningProcess
    Write-Host "  [OK] Stopping process $processId on port 5173"
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2
Write-Host "  [OK] Ports cleaned!"
Write-Host ""

# Start Backend in a new window
Write-Host "Starting Backend Server..."
$backendPath = Join-Path $scriptDir "Backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

Start-Sleep -Seconds 4

# Start Frontend in a new window
Write-Host "Starting Frontend Server..."
$frontendPath = Join-Path $scriptDir "Frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "=================================================="
Write-Host "  [OK] Both servers are starting!"
Write-Host "  Backend:  http://localhost:5001"
Write-Host "  Frontend: http://localhost:5173"
Write-Host "=================================================="
Write-Host ""
Write-Host "Two new windows will open with the servers."
Write-Host "You can close this window now."

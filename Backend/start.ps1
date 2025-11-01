# Backend Startup Script - Kills process on port 5001 and starts the server

Write-Host "Checking for processes on port 5001..."

# Find and kill any process using port 5001
$connection = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($connection) {
    $processId = $connection.OwningProcess
    Write-Host "Found process $processId using port 5001. Stopping it..."
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Process stopped successfully!"
} else {
    Write-Host "Port 5001 is available."
}

# Start the backend server
Write-Host "Starting backend server on port 5001..."
npm run dev

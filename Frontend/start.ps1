# Frontend Startup Script - Kills process on port 5173 and starts the server

Write-Host "Checking for processes on port 5173..."

# Find and kill any process using port 5173
$connection = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($connection) {
    $processId = $connection.OwningProcess
    Write-Host "Found process $processId using port 5173. Stopping it..."
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Process stopped successfully!"
} else {
    Write-Host "Port 5173 is available."
}

# Start the frontend server
Write-Host "Starting frontend server on port 5173..."
npm run dev

# Startup Scripts - No More Port Conflicts! 🚀

## Problem Solved
These scripts automatically kill any processes using ports 5001 (Backend) and 5173 (Frontend) before starting the servers, eliminating port conflict issues forever.

## Quick Start (Easiest Method)

### Windows - Just Double Click!
1. Navigate to the project root folder
2. Double-click `start-all.bat` 
3. Done! ✓

Or from command prompt/PowerShell:
```cmd
start-all.bat
```

This will:
- Clean up both ports (5001 and 5173)
- Start Backend in a new window
- Start Frontend in a new window
- Show you the URLs for both services

## Alternative Methods

### Option 1: PowerShell Script
Run this from the project root directory:
```powershell
.\start-all.ps1
```

### Option 2: Start Backend Only
```powershell
cd Backend
.\start.ps1
```
Or using npm:
```powershell
cd Backend
npm run dev:clean
```

### Option 3: Start Frontend Only
```powershell
cd Frontend
.\start.ps1
```
Or using npm:
```powershell
cd Frontend
npm run dev:clean
```

### Option 4: Original Method (May Have Port Conflicts)
```powershell
# Backend
cd Backend
npm run dev

# Frontend
cd Frontend
npm run dev
```

## What Each Script Does

### `start-all.ps1` (Root Directory)
- Checks and kills processes on ports 5001 and 5173
- Opens two new PowerShell windows
- Starts Backend in one window
- Starts Frontend in another window
- Displays success message with URLs

### `Backend/start.ps1`
- Checks and kills any process using port 5001
- Starts the Backend server with nodemon
- MongoDB connection and Express server on http://localhost:5001

### `Frontend/start.ps1`
- Checks and kills any process using port 5173
- Starts the Frontend Vite dev server
- React app on http://localhost:5173

## PowerShell Execution Policy

If you get an execution policy error, run this once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## How It Works

Each script uses PowerShell's `Get-NetTCPConnection` to find processes listening on the required ports, then stops them before starting the server. This ensures a clean start every time.

## Service URLs

After running the scripts, access your application at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **MongoDB**: Connected to your MongoDB Atlas cluster

## Troubleshooting

### Script won't run
- Make sure you're in PowerShell (not CMD)
- Set execution policy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Port still in use
- Run `start-all.ps1` again (it will force-kill the processes)
- Or manually kill all node processes: `Stop-Process -Name node -Force`

### Backend crashes
- Check MongoDB connection in `.env` file
- Verify all dependencies: `cd Backend && npm install`

### Frontend crashes
- Verify all dependencies: `cd Frontend && npm install`
- Check if port 5173 is available

## Benefits

✅ No more "EADDRINUSE" errors
✅ One command to start everything
✅ Automatic cleanup of stale processes
✅ Separate windows for easy monitoring
✅ Colored output for better visibility
✅ Works every time!

## Notes

- The scripts will automatically request admin privileges if needed
- Each server runs in its own PowerShell window
- You can close the startup script window after servers start
- To stop servers, just close their PowerShell windows or press Ctrl+C

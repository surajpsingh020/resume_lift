# Backend + MongoDB Docker (development)

This file explains how to run the backend and a local MongoDB container for development, while keeping the frontend running with Vite.

Prerequisites
- Docker Desktop installed & running
- PowerShell (Windows) or equivalent shell

Files
- `docker-compose.yml` (in this folder) brings up `mongodb` (mongo:6.0) and `backend` (built from this folder's `Dockerfile`).
- `.env` contains other runtime env vars (do NOT commit secrets).

Quick steps (PowerShell)

1. Stop any process using port 5001 (prevents EADDRINUSE):

```powershell
# list processes using port 5001
netstat -aon | Select-String ":5001"

# if you see a PID in the output, stop it (replace <PID>):
Stop-Process -Id <PID> -Force
```

2. Build and start the backend + local mongo (detached):

```powershell
cd C:\Users\KIIT0001\Desktop\Repos\ai-resume-builder\Backend
docker compose up --build -d
```

3. Check container status and logs:

```powershell
docker compose ps
docker compose logs --tail 200 backend
docker compose logs --tail 200 mongodb
```

4. Verify backend health (wait a few seconds if containers are still initializing):

```powershell
Invoke-RestMethod http://localhost:5001/
# or curl http://localhost:5001/
```

5. Stop and cleanup when done:

```powershell
# stop containers but keep data volume
docker compose down

# stop and remove volumes (this will delete DB data):
docker compose down -v
```

Notes
- The `docker-compose.yml` in this folder overrides `MONGODB_URI` to `mongodb://mongodb:27017` so the backend connects to the local containerized MongoDB for development. Your existing `.env` values are preserved for other settings but the DB connection will use the local container during compose runs.
- For frontend development, keep running Vite locally (e.g. `cd Frontend && npm run dev`) and set `VITE_APP_URL` to `http://localhost:5001` in your local Vite env file.
- Do NOT commit `.env` with credentials. If the Atlas credentials were committed previously, rotate them in Atlas.

Troubleshooting
- If the backend logs show repeated connection failures, run `docker compose logs mongodb` to see Mongo startup errors.
- If `docker compose up` fails due to build errors, check that `package*.json` files exist in the `Backend/` folder and that `.dockerignore` isn't excluding them.

If you want, I can also add a root-level `docker-compose.yml` to run the frontend containerized (production) — tell me if you'd like that.

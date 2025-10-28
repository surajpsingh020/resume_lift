# Backend — Docker Development

This README explains how to run the backend and a local MongoDB for development using Docker Compose, and how to use the Frontend (Vite) during development.

Prerequisites
- Docker Desktop (running)
- Node.js & npm (for frontend dev)

Files
- `docker-compose.yml` — starts a local MongoDB (`mongo:6.0`) and the backend (built from this folder's `Dockerfile`).
- `.env` — runtime environment variables (do NOT commit production secrets).

Quick start (PowerShell)

1. Make sure Docker Desktop is running (wait until Docker Engine is ready).

2. From this folder, build and run the backend + local MongoDB:

```powershell
cd C:\Users\KIIT0001\Desktop\Repos\ai-resume-builder\Backend
docker compose up --build -d
```

3. Check running containers and logs:

```powershell
docker compose ps
docker compose logs --tail 200 backend
docker compose logs --tail 200 mongodb
```

4. Health check (backend)

```powershell
Invoke-RestMethod http://localhost:5001/
# or: curl http://localhost:5001/
```

Stop & cleanup

```powershell
docker compose down           # stop containers (keep volumes)
docker compose down -v        # stop containers and remove volumes (deletes DB data)
```

Frontend (development)
- Keep running the frontend via Vite (recommended for dev):

```powershell
cd C:\Users\KIIT0001\Desktop\Repos\ai-resume-builder\Frontend
npm install
npm run dev
```

- When running Vite locally, set `VITE_APP_URL=http://localhost:5001` in your local Vite env so the frontend calls the containerized backend.

Security & housekeeping
- Do NOT commit `.env` with production credentials. If the Atlas URI in `.env` was committed earlier, rotate the Atlas credentials immediately.
- For production deploys, set environment variables on the host (Render, Vercel, Docker host) rather than keeping them in `.env` in the repo.

Troubleshooting
- Docker daemon not running: open Docker Desktop and wait until it reports 'Docker Engine running'.
- Mongo fails to start (crash loop): existing volume may contain incompatible data — remove the volume (`docker compose down -v`) to start fresh or restore from a backup.
- Backend cannot resolve `mongodb`: ensure both services are started via `docker compose up` from this folder and that `MONGODB_URI` is overridden to `mongodb://mongodb:27017` in compose.

Next steps / options
- If you want a fully containerized stack (frontend + backend + mongodb), I can add a root-level `docker-compose.yml` and a production `Frontend/Dockerfile` (multi-stage build using Nginx).
- If you want, I can rotate/remove the embedded Atlas credentials and add a `.env.example` file instead.

---
Generated on: 2025-10-28

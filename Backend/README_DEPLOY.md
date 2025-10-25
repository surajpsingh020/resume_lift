Deployment notes — ai-resume-builder Backend

Quick path (Render / Railway)

1) Build & push Docker image (automatic via GitHub Actions)
   - Add these GitHub secrets to your repo: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN
   - Push to `main`. The workflow `/.github/workflows/docker-image.yml` builds the image from `Backend/Dockerfile` and pushes `DOCKERHUB_USERNAME/ai-resume-builder-backend:latest`.

2) Deploy to Render (recommended quick deploy)
   - Create a new Web Service on Render.
   - Choose Docker and connect to your GitHub repo, or provide the Docker image from Docker Hub.
   - Add environment variables under Service Settings (exact keys from `Backend/.env` — MONGODB_URI, JWT_SECRET_KEY, PORT, ALLOWED_SITE, etc.).
   - Set the health check path to `/` and configure auto deploy from GitHub if desired.

3) Quick test locally
   - Make sure `Backend/.env` contains your `MONGODB_URI` (Atlas) and other keys.
   - From `Backend` folder:
     npm install
     npm run test-mongo
   - Start with docker-compose locally (already supported):
     docker-compose down
     docker-compose up -d --build
     docker-compose logs -f backend

CI/CD details
- Workflow: `/.github/workflows/docker-image.yml` builds and pushes on `main`.
- Secrets required in GitHub: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN.

Security notes
- Don't store secrets in the repo. Use the provider's environment secret store (Render, GitHub Secrets, etc.).
- After testing, tighten Atlas IP access rules.

# Deployment & CI/CD setup

This document lists the secrets and steps required to deploy the project using GitHub Actions, GHCR (GitHub Container Registry), Render (backend), and Vercel (frontend).

Important: Do NOT commit `Backend/.env` or any file containing real credentials. Keep `Backend/.env.example` in the repo to document required variables.

Required GitHub repository secrets
- `PRODUCTION_MONGODB_URI` — your Atlas connection string (rotate if previously exposed).
- `JWT_SECRET` — backend JWT signing secret.
- `GEMINI_API_KEY` — move the Gemini API key to the backend and provide it here.
- `RENDER_API_KEY` — (optional) Render service API key used to trigger deploys from Actions.
- `RENDER_SERVICE_ID` — (optional) the Render service id for your backend service.
- `VERCEL_TOKEN` — (optional) token to trigger Vercel deployments from Actions (if you choose Actions-driven deploys).
- `GHCR_PAT` — (optional) personal access token with `write:packages` if your org blocks `GITHUB_TOKEN` for package writes.

How to add GitHub secrets
1. Go to your repository on GitHub → Settings → Secrets and variables → Actions → New repository secret.
2. Add each key above with its value. Secrets are masked in logs and not visible after saving.

Render setup (recommended)
- Option A (recommended): Connect Render to GitHub and let Render build from your repo. In Render dashboard create a new Web Service and choose GitHub as the source. Set the service `start` command to `node src/index.js` (or use the Docker image option).
- Option B: Use Render's Deploy-from-Image approach. In this case, configure your Render Service to accept image-based deploys. You can then use the GitHub Actions workflow provided to push an image to GHCR and call the Render API to trigger a deploy.

Render API deploy (what the workflow does)
- The CI workflow will push the backend image to GHCR and then, if `RENDER_API_KEY` and `RENDER_SERVICE_ID` are present, POST a JSON payload to Render's deploy endpoint with keys `image` (the GHCR image URL) and `message` (the commit SHA). This is non-destructive and documents the image that should be deployed.

Vercel setup (frontend)
- The simplest path is to connect Vercel to your GitHub repo and let Vercel build the frontend on push (recommended). Configure `VITE_APP_URL` in Vercel's Environment Variables to point to your backend production URL.
- Alternatively, store `VERCEL_TOKEN` in GitHub Secrets and add an Actions step to run `vercel --prod --token $VERCEL_TOKEN` after building.

Untrack `Backend/.env` locally (run on your machine)
1. Ensure you have `Backend/.env` saved locally (do not delete the file yet).
2. From the repository root run:

```powershell
git rm --cached Backend/.env
git commit -m "Stop tracking Backend/.env (remove secrets)"
git push origin main
```

Rotate credentials immediately
- If `Backend/.env` was previously committed, rotate the exposed credentials (create a new DB user / URI in Atlas, rotate JWT secret, etc.). Treat them as compromised.

Scrubbing history (advanced)
- If you must remove secrets from the repository history, use BFG or `git filter-repo`. This rewrites history and requires all collaborators to re-clone. Only do this if you understand the consequences.

Example secret usage in GitHub Actions (already used in workflows)
- In Actions you can reference secrets as `${{ secrets.PRODUCTION_MONGODB_URI }}` or `${{ secrets.RENDER_API_KEY }}`.

If you want I can:
- (A) commit a change that adds `Backend/.env` to `.gitignore` and remove it from the index (I can create the commit, but I won't rotate keys), or
- (B) prepare a step-by-step guide to rotate your Atlas credentials, or
- (C) help you scrub the secret from history (I will explain the force-push workflow and consequences).

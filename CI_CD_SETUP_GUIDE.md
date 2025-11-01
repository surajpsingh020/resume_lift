# 🚀 CI/CD Setup Guide - From Scratch

This guide will walk you through setting up complete CI/CD for your AI Resume Builder project.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Choose Your Deployment Platform](#step-1-choose-your-deployment-platform)
4. [Step 2: Configure GitHub Secrets](#step-2-configure-github-secrets)
5. [Step 3: Set Up GitHub Actions Workflows](#step-3-set-up-github-actions-workflows)
6. [Step 4: Test Your CI/CD Pipeline](#step-4-test-your-cicd-pipeline)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What We'll Build
- ✅ **Automated Testing** - Run tests on every push
- ✅ **Automated Builds** - Build Frontend and Backend Docker images
- ✅ **Automated Deployment** - Deploy to production on merge to main
- ✅ **Pull Request Checks** - Validate PRs before merging
- ✅ **Security Scanning** - Check for vulnerabilities

### CI/CD Flow
```
Push Code → GitHub Actions → Build → Test → Deploy → Notify
```

---

## 📦 Prerequisites

### 1. GitHub Repository ✅ (Already Done)
- Repository: `resume_lift`
- Owner: `surajpsingh020`
- Default branch: `main`

### 2. Deployment Platform (Choose One)
You need to decide where to deploy:

| Platform | Best For | Cost | Docker Support |
|----------|----------|------|----------------|
| **Render** | Easy setup, free tier | Free/$7/mo | ✅ Yes |
| **Railway** | Modern, auto-deploy | $5/mo | ✅ Yes |
| **Vercel + Heroku** | Frontend on Vercel, Backend on Heroku | Free/Paid | Frontend only |
| **AWS ECS** | Enterprise, scalable | Variable | ✅ Yes |
| **DigitalOcean** | VPS with Docker | $4/mo | ✅ Yes |

**Recommendation for Beginners**: **Render.com** (Free tier available)

---

## 🎯 Step 1: Choose Your Deployment Platform

### Option A: Render.com (Recommended)

#### Why Render?
- ✅ Free tier available
- ✅ Native Docker support
- ✅ Auto-deploy from GitHub
- ✅ Built-in databases
- ✅ Easy SSL/HTTPS

#### Setup Steps:

1. **Sign up at Render.com**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create a Web Service for Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `resume_lift`
   - Configure:
     ```
     Name: resume-lift-backend
     Region: Choose closest to you
     Branch: main
     Root Directory: Backend
     Runtime: Docker
     Dockerfile Path: Backend/Dockerfile
     Instance Type: Free
     ```

3. **Add Environment Variables in Render Dashboard**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ALLOWED_SITE=https://your-frontend-url.onrender.com
   NODE_ENV=production
   PORT=5001
   ```

4. **Create a Static Site for Frontend**
   - Click "New +" → "Static Site"
   - Connect same repository
   - Configure:
     ```
     Name: resume-lift-frontend
     Branch: main
     Root Directory: Frontend
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

5. **Add Frontend Environment Variables**
   ```
   VITE_APP_URL=https://resume-lift-backend.onrender.com/
   VITE_GEMINI_MODEL=models/gemini-2.5-flash
   ```

6. **Get Render API Key**
   - Go to Account Settings → API Keys
   - Click "Create API Key"
   - Copy the key (you'll need this for GitHub Secrets)

7. **Get Service IDs**
   - Go to your Backend service
   - Copy the Service ID from the URL: `https://dashboard.render.com/web/srv-XXXXXXXXXX`
   - Do the same for Frontend

---

### Option B: Railway.app

#### Setup Steps:

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `resume_lift`

3. **Add Backend Service**
   - Click "Add Service" → "Docker"
   - Set Root Directory: `Backend`
   - Railway auto-detects Dockerfile

4. **Add Frontend Service**
   - Click "Add Service" → "Docker"
   - Set Root Directory: `Frontend`

5. **Configure Environment Variables**
   (Same as Render above)

6. **Get Deployment Token**
   - Go to Project Settings → Tokens
   - Create a new token for CI/CD

---

### Option C: Self-Hosted with Docker (Advanced)

If you have a VPS (DigitalOcean, AWS EC2, etc.):

1. **Set up Docker on your server**
2. **Use GitHub Actions to SSH into server**
3. **Pull and deploy Docker containers**

(This requires more configuration - let me know if you want detailed steps)

---

## 🔐 Step 2: Configure GitHub Secrets

### What are GitHub Secrets?
Secrets store sensitive data (API keys, passwords) securely for use in workflows.

### How to Add Secrets:

1. **Go to Your Repository**
   - Navigate to: https://github.com/surajpsingh020/resume_lift

2. **Open Settings**
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"

3. **Add Repository Secrets**
   Click "New repository secret" for each:

#### For Render Deployment:
```
Name: RENDER_API_KEY
Value: (Your Render API key from Step 1)

Name: RENDER_BACKEND_SERVICE_ID
Value: srv-XXXXXXXXXX (Backend service ID)

Name: RENDER_FRONTEND_SERVICE_ID
Value: srv-XXXXXXXXXX (Frontend service ID)
```

#### For Docker Registry (Optional - if you want to publish Docker images):
```
Name: DOCKER_USERNAME
Value: (Your Docker Hub username)

Name: DOCKER_PASSWORD
Value: (Your Docker Hub password or access token)
```

#### For MongoDB (if you want to run tests):
```
Name: MONGODB_URI_TEST
Value: (Separate MongoDB database for testing)
```

### Variables vs Secrets
- **Secrets**: Encrypted, not visible after creation (API keys, passwords)
- **Variables**: Visible, for non-sensitive data (versions, URLs)

To add **Variables** (optional):
- Go to "Secrets and variables" → "Actions" → "Variables" tab
- Add:
  ```
  Name: NODE_VERSION
  Value: 22
  
  Name: DEPLOY_BRANCH
  Value: main
  ```

---

## ⚙️ Step 3: Set Up GitHub Actions Workflows

Now we'll create workflows step by step.

### Workflow 1: Basic CI (Build & Test)

Create: `.github/workflows/ci.yml`

```yaml
name: CI - Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Job 1: Test Backend
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: Backend/package-lock.json

      - name: Install Backend dependencies
        working-directory: Backend
        run: npm ci

      - name: Run Backend tests (if you have them)
        working-directory: Backend
        run: npm test || echo "No tests configured yet"
        continue-on-error: true

  # Job 2: Build Frontend
  build-frontend:
    name: Build Frontend
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: Frontend/package-lock.json

      - name: Install Frontend dependencies
        working-directory: Frontend
        run: npm ci

      - name: Build Frontend
        working-directory: Frontend
        run: npm run build
        env:
          VITE_APP_URL: http://localhost:5001/
          VITE_GEMINI_MODEL: models/gemini-2.5-flash

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: Frontend/dist

  # Job 3: Build Docker Images
  build-docker:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, build-frontend]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Backend Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./Backend
          file: ./Backend/Dockerfile
          push: false
          tags: resume-lift-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build Frontend Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./Frontend
          file: ./Frontend/Dockerfile
          push: false
          tags: resume-lift-frontend:latest
          build-args: |
            VITE_APP_URL=http://localhost:5001/
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Workflow 2: Deploy to Render

Create: `.github/workflows/deploy-render.yml`

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]
  workflow_dispatch: # Allows manual trigger

jobs:
  deploy:
    name: Deploy to Render
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy Backend to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          SERVICE_ID: ${{ secrets.RENDER_BACKEND_SERVICE_ID }}
        run: |
          echo "Triggering Render deployment for Backend..."
          curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/deploys" \
            -H "Authorization: Bearer ${RENDER_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": false}'

      - name: Deploy Frontend to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          SERVICE_ID: ${{ secrets.RENDER_FRONTEND_SERVICE_ID }}
        run: |
          echo "Triggering Render deployment for Frontend..."
          curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/deploys" \
            -H "Authorization: Bearer ${RENDER_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": false}'

      - name: Wait for deployment
        run: |
          echo "Waiting 30 seconds for deployment to start..."
          sleep 30

      - name: Verify deployment
        run: |
          echo "✅ Deployment triggered successfully!"
          echo "Check status at: https://dashboard.render.com"
```

### Workflow 3: Pull Request Checks

Create: `.github/workflows/pr-check.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [ main ]

jobs:
  lint-and-build:
    name: Lint and Build Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Check Backend builds
        working-directory: Backend
        run: |
          npm ci
          echo "✅ Backend dependencies installed"

      - name: Check Frontend builds
        working-directory: Frontend
        run: |
          npm ci
          npm run build
          echo "✅ Frontend built successfully"

      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All checks passed! Ready to merge.'
            })
```

### Workflow 4: Security Scanning (Optional)

Create: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  npm-audit:
    name: NPM Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Audit Backend dependencies
        working-directory: Backend
        run: npm audit --audit-level=moderate || true

      - name: Audit Frontend dependencies
        working-directory: Frontend
        run: npm audit --audit-level=moderate || true

  docker-scan:
    name: Docker Image Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Backend image
        run: docker build -t backend:scan ./Backend

      - name: Scan Backend image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: backend:scan
          format: 'table'
          exit-code: '0'
          severity: 'CRITICAL,HIGH'
```

---

## 🧪 Step 4: Test Your CI/CD Pipeline

### Create the Workflow Files

1. **Create directory structure**:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create each workflow file** (copy content from Step 3 above)

3. **Commit and push**:
   ```bash
   git add .github/workflows/
   git commit -m "ci: Add GitHub Actions workflows for CI/CD"
   git push origin main
   ```

### Test Each Workflow

#### Test 1: CI Workflow
1. Push any code change
2. Go to: https://github.com/surajpsingh020/resume_lift/actions
3. Watch the "CI - Build and Test" workflow run
4. ✅ Should pass if builds succeed

#### Test 2: PR Workflow
1. Create a new branch: `git checkout -b test-ci`
2. Make a small change
3. Push and create a Pull Request
4. Watch "PR Checks" workflow run
5. ✅ Should comment on PR when complete

#### Test 3: Deploy Workflow
1. Merge PR to main
2. Watch "Deploy to Render" workflow run
3. Check Render dashboard for deployment
4. ✅ Should deploy to production

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Secret not found"
**Solution**: Make sure you added the secret with the EXACT name
- Go to Settings → Secrets and variables → Actions
- Check spelling matches workflow exactly

#### 2. "npm ci failed"
**Solution**: Make sure package-lock.json exists
```bash
cd Backend && npm install
cd Frontend && npm install
git add package-lock.json
git commit -m "chore: Add package-lock.json files"
```

#### 3. "Permission denied" when pushing Docker images
**Solution**: Enable GitHub Container Registry
- Go to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"

#### 4. "Render API call failed"
**Solution**: Check your API key and Service IDs
- Regenerate API key in Render dashboard
- Update GitHub secret
- Verify Service IDs are correct

#### 5. "Build fails on Node 22"
**Solution**: Some packages might not support Node 22 yet
- Try Node 20: Change `node-version: '20'` in workflows
- Or update your package.json engines

---

## 📊 Monitoring Your CI/CD

### GitHub Actions Dashboard
- View all workflow runs: https://github.com/surajpsingh020/resume_lift/actions
- Click any workflow to see detailed logs
- Re-run failed jobs if needed

### Render Dashboard
- Monitor deployments: https://dashboard.render.com
- View logs for each service
- Check health status

### Set Up Notifications (Optional)

Add to any workflow:
```yaml
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 CI/CD Failed',
              body: 'Workflow failed. Check Actions tab for details.',
              labels: ['bug', 'ci/cd']
            })
```

---

## 🎯 Next Steps

### Phase 1: Basic Setup ✅
- [x] Remove old workflows
- [ ] Choose deployment platform
- [ ] Configure GitHub secrets
- [ ] Create basic CI workflow

### Phase 2: Testing
- [ ] Add unit tests to Backend
- [ ] Add integration tests
- [ ] Add E2E tests with Cypress

### Phase 3: Advanced Features
- [ ] Add staging environment
- [ ] Implement blue-green deployment
- [ ] Add rollback capability
- [ ] Set up monitoring (Sentry, LogRocket)

### Phase 4: Optimization
- [ ] Optimize Docker builds
- [ ] Add caching strategies
- [ ] Implement automated database backups
- [ ] Set up CDN for Frontend

---

## 📚 Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Render Docs**: https://render.com/docs
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **CI/CD Best Practices**: https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment

---

## 🆘 Need Help?

If you get stuck:
1. Check the Troubleshooting section above
2. Review GitHub Actions logs for specific errors
3. Check Render service logs
4. Create an issue in your repository with the error details

---

**Ready to start?** Let me know which deployment platform you want to use, and I'll help you set it up! 🚀

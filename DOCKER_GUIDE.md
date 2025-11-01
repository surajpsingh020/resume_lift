# 🐳 Docker Setup Guide

Complete Docker containerization for AI Resume Builder with multiple deployment options.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Setup Options](#setup-options)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [Development Mode](#development-mode)
- [Commands Reference](#commands-reference)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Production (Recommended for Deployment)
```bash
# Double-click this file:
docker-start-prod.bat

# Or run manually:
docker-compose up -d --build
```
**Access:** http://localhost (Frontend) | http://localhost:5001 (Backend)

### Development (Hot-Reload Enabled)
```bash
# Double-click this file:
docker-start-dev.bat

# Or run manually:
docker-compose -f docker-compose.dev.yml up -d --build
```
**Access:** http://localhost:5173 (Frontend) | http://localhost:5001 (Backend)

---

## 📦 Setup Options

| Option | Frontend | Backend | MongoDB | Hot-Reload | Best For |
|--------|----------|---------|---------|------------|----------|
| **Production** | Nginx (Port 80) | Node.js (5001) | Mongo 6.0 | ❌ | Deployment |
| **Development** | Vite (Port 5173) | Nodemon (5001) | Mongo 6.0 | ✅ | Active Dev |
| **Backend Only** | Run locally | Docker (5001) | Docker | ✅ Backend | Frontend Dev |

---

## 🛠️ Prerequisites

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download: https://www.docker.com/products/docker-desktop
   - Version: 20.10 or higher

2. **Docker Compose**
   - Included with Docker Desktop
   - Linux: `sudo apt-get install docker-compose`

3. **Environment Files**
   - `Backend/.env` (see Configuration section)
   - `Frontend/.env.local` (optional for local overrides)

---

## ⚙️ Configuration

### Backend Environment (`Backend/.env`)

```env
# MongoDB Connection (Docker will override this)
MONGODB_URI=mongodb://mongodb:27017/ai-resume-builder

# Server Configuration
PORT=5001
NODE_ENV=production

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_change_this
JWT_SECRET_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_SITE=http://localhost

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Environment (`Frontend/.env.local`)

```env
# Backend API URL
VITE_APP_URL=http://localhost:5001/

# AI API Key (optional if using backend proxy)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Important:** The `MONGODB_URI` will be automatically set by Docker Compose to connect to the containerized MongoDB.

---

## 🏭 Production Deployment

### Quick Start (Using Script)
```bash
docker-start-prod.bat
```

### Manual Commands
```bash
# Build images
docker-compose build --no-cache

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Services Included
- **Frontend:** Production-optimized React build served by Nginx on port 80
- **Backend:** Node.js API server on port 5001
- **MongoDB:** Database on port 27017 with persistent volume

### Features
- ✅ Multi-stage builds for smaller images
- ✅ Health checks for all services
- ✅ Automatic restart on failure
- ✅ Persistent data volumes
- ✅ Optimized Nginx configuration
- ✅ Security headers enabled

---

## 💻 Development Mode

### Quick Start (Using Script)
```bash
docker-start-dev.bat
```

### Manual Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart a service
docker-compose -f docker-compose.dev.yml restart backend

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Features
- ✅ **Hot-reload enabled** for Frontend (Vite) and Backend (Nodemon)
- ✅ Source code mounted as volumes
- ✅ No need to rebuild after code changes
- ✅ Fast development cycle
- ✅ Same environment as production

### File Watching
Changes to these files will trigger auto-reload:
- `Frontend/src/**/*` → Vite hot-reload
- `Backend/src/**/*` → Nodemon restart

---

## 📝 Commands Reference

### Production Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v

# Rebuild specific service
docker-compose build frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f                  # All services
docker-compose logs -f backend          # Backend only
docker-compose logs -f --tail=100       # Last 100 lines

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

### Development Commands

```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down

# Restart service
docker-compose -f docker-compose.dev.yml restart backend

# View logs with hot-reload
docker-compose -f docker-compose.dev.yml logs -f

# Access container shell
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec frontend sh
```

### Cleanup Commands

```bash
# Use the cleanup script
docker-stop.bat

# Or manually:
docker-compose down
docker-compose -f docker-compose.dev.yml down

# Remove all volumes (⚠️ DELETES ALL DATA)
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v

# Remove dangling images
docker image prune -f

# Complete cleanup (⚠️ NUCLEAR OPTION)
docker system prune -a --volumes
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:5001 failed: port is already allocated`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Or use the startup scripts which handle this automatically
docker-stop.bat
docker-start-prod.bat
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs mongodb

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### MongoDB Connection Issues

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Wait for health check
docker-compose ps
```

### Frontend Can't Connect to Backend

**Error:** Network errors or CORS issues

**Solution:**
1. Check Backend is running: `docker-compose ps backend`
2. Verify ALLOWED_SITE in Backend/.env: `ALLOWED_SITE=http://localhost`
3. Check Frontend environment: `VITE_APP_URL=http://localhost:5001/`
4. Restart services: `docker-compose restart`

### Hot-Reload Not Working (Dev Mode)

**Solution:**
```bash
# Ensure volumes are mounted correctly
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Check volume mounts
docker-compose -f docker-compose.dev.yml exec backend ls -la /app
```

### Build Fails

**Error:** `npm install` or build errors

**Solution:**
```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache

# Check .dockerignore files
# Make sure node_modules is excluded

# Try building individual service
docker-compose build backend
```

### Database Data Lost

**Solution:**
```bash
# Check volumes
docker volume ls

# Backup volumes before cleanup
docker run --rm -v ai-resume-builder_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data

# Restore from backup
docker run --rm -v ai-resume-builder_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /
```

---

## 📊 Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# Services should show (healthy) status
# If (unhealthy), check logs:
docker-compose logs <service-name>
```

**Health Check Endpoints:**
- Backend: `http://localhost:5001/`
- Frontend: `http://localhost/` or `http://localhost:5173/`
- MongoDB: Internal ping command

---

## 🚢 Deployment Recommendations

### For VPS/Cloud Deployment (AWS, DigitalOcean, etc.)

1. **Use Production compose:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Enable SSL with Nginx Reverse Proxy:**
   - Install Certbot
   - Configure domain pointing
   - Update Nginx configuration

3. **Set Production Environment Variables:**
   ```env
   NODE_ENV=production
   ALLOWED_SITE=https://yourdomain.com
   ```

4. **Enable Docker Auto-Restart:**
   ```bash
   docker-compose up -d --restart unless-stopped
   ```

### For Heroku/PaaS

- Use production Dockerfile
- Configure PORT environment variable
- Use MongoDB Atlas for database
- Set MONGODB_URI to Atlas connection string

---

## 📦 Container Sizes

Approximate image sizes:
- **Backend (Production):** ~150 MB
- **Backend (Development):** ~200 MB
- **Frontend (Production):** ~50 MB (Nginx)
- **Frontend (Development):** ~400 MB (with dev deps)
- **MongoDB:** ~700 MB

---

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

## ✅ Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Use `.dockerignore`** - Exclude node_modules, .git, logs
3. **Multi-stage builds** - Reduce production image size
4. **Health checks** - Enable for all services
5. **Named volumes** - For data persistence
6. **Non-root user** - Security best practice
7. **Cache optimization** - Copy package.json first
8. **Proper cleanup** - Stop containers when not in use

---

**Need help?** Check the main README.md or create an issue on GitHub.

**Made with 🐳 Docker**

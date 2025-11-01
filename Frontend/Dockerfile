# Frontend Dockerfile for Production
FROM node:20-alpine AS build

# Build arguments for environment variables
ARG VITE_APP_URL=http://localhost:5001/

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (need all deps for build)
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_APP_URL=${VITE_APP_URL}

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Remove default nginx config and html
RUN rm -rf /etc/nginx/conf.d/* && rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

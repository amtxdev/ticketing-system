# Multi-stage build for frontend
# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install instead of npm ci since package-lock.json may be out of sync
# For production, consider generating package-lock.json first and using npm ci
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment variables (Vite uses VITE_ prefix)
# This is the URL the browser will use to reach the backend API
# Must be accessible from the user's browser (not from Docker network)
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Install wget for healthcheck (if not already available)
RUN apk add --no-cache wget || true

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - uses default for SPA)
# For Single Page Application routing, configure nginx to serve index.html for all routes
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

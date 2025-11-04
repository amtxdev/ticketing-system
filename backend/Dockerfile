# Backend Dockerfile with Nginx reverse proxy
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage with Node.js and Nginx
FROM node:20-alpine

# Install nginx and wget (for healthchecks)
RUN apk add --no-cache nginx wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /run/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx /run/nginx

# Expose nginx port (Node.js runs on 3000 internally)
EXPOSE 80

# Start script that runs both Node.js and Nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]



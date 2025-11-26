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

# Nginx stage - extract nginx binaries
FROM nginx:alpine AS nginx-stage
RUN apk add --no-cache wget || true

# Production stage with Node.js and Nginx
FROM node:20-alpine

# Copy nginx binary and config from nginx-stage
COPY --from=nginx-stage /usr/sbin/nginx /usr/sbin/nginx
COPY --from=nginx-stage /etc/nginx /etc/nginx
# Copy wget and all nginx dependencies using mount
RUN --mount=from=nginx-stage,source=/usr/bin/wget,target=/tmp/wget \
    cp /tmp/wget /usr/bin/wget 2>/dev/null || true
RUN --mount=from=nginx-stage,source=/usr/lib,target=/tmp/nginx-lib \
    mkdir -p /usr/lib && \
    cp -a /tmp/nginx-lib/libpcre2*.so* /usr/lib/ 2>/dev/null || true && \
    cp -a /tmp/nginx-lib/libpcre*.so* /usr/lib/ 2>/dev/null || true && \
    cp -a /tmp/nginx-lib/libssl*.so* /usr/lib/ 2>/dev/null || true && \
    cp -a /tmp/nginx-lib/libcrypto*.so* /usr/lib/ 2>/dev/null || true && \
    cp -a /tmp/nginx-lib/libz*.so* /usr/lib/ 2>/dev/null || true
# Create nginx directories and user
RUN mkdir -p /var/log/nginx /var/cache/nginx /run/nginx && \
    addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true
    

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions for nginx directories
RUN chown -R nginx:nginx /var/log/nginx /var/cache/nginx /run/nginx 2>/dev/null || true

# Expose nginx port (Node.js runs on 3000 internally)
EXPOSE 80

# Start script that runs both Node.js and Nginx
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]



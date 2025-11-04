# Load Balancer Architecture

This project includes Nginx load balancers for both frontend and backend, distributing traffic across multiple instances for high availability and scalability.

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼──────────────┐
│ Frontend Load       │
│ Balancer (Nginx)    │
│      :3001          │
└──────┬──────────────┘
       │
  ┌────┴────┐
  │         │
┌─▼──────┐ ┌▼──────┐
│Frontend│ │Frontend│
│   1    │ │   2    │
│(Nginx) │ │(Nginx) │
└────────┘ └────────┘
       │
       │ (API calls)
       │
┌──────▼──────────────┐
│ Backend Load        │
│ Balancer (Nginx)    │
│      :3000          │
└──────┬──────────────┘
       │
  ┌────┴────┐
  │         │
┌─▼──────┐ ┌▼──────┐
│Backend │ │Backend│
│   1    │ │   2   │
│Nginx→Node│Nginx→Node│
└────────┘ └────────┘
```

## Components

### 1. Frontend Instances (frontend-1, frontend-2)
- Each frontend container serves static React files:
  - **Nginx** serving pre-built static files (HTML, CSS, JS)
  - No external ports (accessed via frontend load balancer)
- Features:
  - SPA routing support
  - Static asset serving
  - Gzip compression

### 2. Frontend Load Balancer (nginx-lb-frontend)
- Standalone Nginx container
- Distributes requests across frontend instances
- Uses **round-robin** algorithm (good for static files)
- Features:
  - Health checks
  - Automatic failover
  - Static asset caching
  - Security headers

### 3. Backend Instances (backend-1, backend-2)
- Each backend container includes:
  - **Node.js application** running on port 3000 (internal)
  - **Nginx reverse proxy** on port 80 (internal)
  - Nginx handles:
    - Request forwarding to Node.js
    - Compression (gzip)
    - Security headers
    - Connection pooling

### 4. Backend Load Balancer (nginx-lb-backend)
- Standalone Nginx container
- Distributes requests across backend instances
- Uses **least_conn** algorithm (better than round-robin for long connections)
- Features:
  - Health checks
  - Automatic failover
  - Rate limiting
  - Request retry logic


## Load Balancing Algorithms

### Frontend Load Balancer
Uses **round-robin** which:
- Distributes requests evenly across frontend instances
- Good for stateless static file serving
- Simple and effective for SPA applications

### Backend Load Balancer
Uses **least_conn** which:
- Routes requests to the backend with the fewest active connections
- Better for long-lived connections (WebSockets, streaming)
- More efficient than round-robin for API requests

Other available algorithms:
- `round-robin` (default) - Distributes evenly
- `ip_hash` - Sticky sessions by IP
- `hash` - Custom hash-based routing
- `least_conn` - Fewest active connections

## Configuration Files

All load balancer configurations are in `infra/nginx-lb/`:

### Frontend Load Balancer (`infra/nginx-lb/frontend-lb.conf`)
- Load balancing configuration for frontend instances
- Upstream pool with frontend-1 and frontend-2
- Health check endpoint on port 8080
- Static asset caching configuration

### Backend Load Balancer (`infra/nginx-lb/backend-lb.conf`)
- Load balancing configuration for backend instances
- Upstream pool with backend-1 and backend-2
- Health check endpoint on port 8080
- Rate limiting and security headers

### Backend Nginx (`backend/nginx.conf`)
- Reverse proxy configuration within each backend container
- Proxies to `localhost:3000` (Node.js app)
- Handles compression and security headers

## Benefits

1. **High Availability**: If one instance fails, traffic routes to others
2. **Performance**: Load distribution improves throughput for both frontend and backend
3. **Scalability**: Easy to add more instances of either frontend or backend
4. **Redundancy**: Multiple instances reduce single points of failure
5. **Security**: Nginx provides security headers and rate limiting
6. **Compression**: Gzip compression reduces bandwidth
7. **Connection Management**: Better handling of concurrent connections
8. **Static Asset Caching**: Frontend LB caches static assets for better performance

## Scaling

### Adding More Backend Instances

1. Add `backend-3`, `backend-4`, etc. to `docker-compose.yaml`
2. Update `infra/nginx-lb/backend-lb.conf` upstream pool:
   ```nginx
   upstream backend_pool {
       least_conn;
       server backend-1:80 max_fails=3 fail_timeout=30s;
       server backend-2:80 max_fails=3 fail_timeout=30s;
       server backend-3:80 max_fails=3 fail_timeout=30s;  # Add this
   }
   ```

### Adding More Frontend Instances

1. Add `frontend-3`, `frontend-4`, etc. to `docker-compose.yaml`
2. Update `infra/nginx-lb/frontend-lb.conf` upstream pool:
   ```nginx
   upstream frontend_pool {
       server frontend-1:80 max_fails=3 fail_timeout=30s;
       server frontend-2:80 max_fails=3 fail_timeout=30s;
       server frontend-3:80 max_fails=3 fail_timeout=30s;  # Add this
   }
   ```

## Testing Load Balancing

To verify load balancing is working:

```bash
# Check which backend handled each request
docker compose logs backend-1 | grep "Request"
docker compose logs backend-2 | grep "Request"

# Check which frontend served static files
docker compose logs frontend-1
docker compose logs frontend-2

# Check load balancer logs
docker compose logs nginx-lb-backend
docker compose logs nginx-lb-frontend

# Or add logging in your Node.js app to see which instance served the request
```

## Ports

- **Frontend Load Balancer**: `3001` (external access)
- **Frontend LB Health**: `8081` (health check)
- **Backend Load Balancer**: `3000` (external access)
- **Backend LB Health**: `8080` (health check)
- **Frontend Instances**: No external ports (internal only, accessed via frontend LB)
- **Backend Instances**: No external ports (internal only, accessed via backend LB)

## Health Checks

All services include health checks:
- **Frontend instances**: Check root path (port 80) via Nginx
- **Frontend Load Balancer**: Check port 8080 for LB health (exposed on 8081)
- **Backend instances**: Check `/health` via Nginx (port 80)
- **Backend Load Balancer**: Check port 8080 for LB health

## Production Considerations

1. **SSL/TLS**: Add SSL certificates to nginx-lb
2. **Monitoring**: Add Prometheus/Grafana for metrics
3. **Logging**: Centralized logging (ELK, Loki)
4. **Auto-scaling**: Use Kubernetes/Docker Swarm for dynamic scaling
5. **Session Stickiness**: If needed, use `ip_hash` instead of `least_conn`
6. **Rate Limiting**: Adjust limits in nginx-lb config
7. **Caching**: Add Redis for session/cache sharing between instances


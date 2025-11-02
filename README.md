# Ticketing System Scaffold

This is a **starter scaffold** for the technical lead take-home assignment.  
**You are encouraged to reorganize, delete, or replace any files and directories here as you see fit.**  
Use your preferred frameworks, project structure, and tools.

## Directory Overview

- `backend/` — API server, authentication, data access, and related code/config.
- `frontend/` — Web client, routing, and UI/service integration.
- `infra/` — Infrastructure automation scripts/configurations (e.g., Terraform, shell).
- `scripts/` — Utility scripts for build, deployment, etc.
- `docker-compose.yaml` — Example local orchestration (optional; you can replace this with your preferred solution).

> **Note:**  
> This structure is only a starting point.  
> Please refer to the main assignment instructions for requirements and deliverables.

## Getting Started

See each subdirectory's `README.md` for details on expectations and placeholders.

## Running with Docker Compose

From the project root directory:
```bash
docker compose up --build

# View logs
# Follow all logs in real-time
docker compose logs -f

# View last 100 lines of all services
docker compose logs --tail=100

# Backend logs (follow)
docker compose logs -f backend

# PostgreSQL logs
docker compose logs -f postgres

# MinIO logs
docker compose logs -f minio

# MinIO init logs
docker compose logs minio-init

# Show last 50 lines without following
docker compose logs --tail=50 backend

# Show logs with timestamps
docker compose logs -f -t backend

# Show logs since 10 minutes ago
docker compose logs --since 10m backend

# Show logs from specific container (using container name)
docker logs ticketing-backend -f

# Backend container
docker logs ticketing-backend -f

# PostgreSQL container
docker logs ticketing-postgres -f

# MinIO container
docker logs ticketing-minio -f

# Show last 100 lines
docker logs ticketing-backend --tail=100

# Show with timestamps
docker logs ticketing-backend -f -t

# Stop the service
docker compose down
```


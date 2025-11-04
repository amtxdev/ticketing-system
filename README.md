# Ticketing System Scaffold

## Directory Overview

- `backend/` — API server, authentication, data access, and related code/config.
- `frontend/` — Web client and UI/service integration.
- `infra/` — Infrastructure scripts/configurations.
- `scripts/` — Utility scripts for backup, safe-clean, import postman collection, etc.
- `docker-compose.yaml` — Local orchestration

## Related Documentation

- `backend/BE_README.md` - Backend documentation
- `frontend/FE_README.md` - Frontend documentation
- `infra/INFRA_README.md` - Infra documentation
- `infra/LB_README.md` - Load Balancer documentation
- `scripts/Backup_README.md` - Backup documentation
- `scripts/POSTMAN_COLLECTION.md` - Postman Collection documentation
- `scripts/Script_README.md` - Script documentation


## Getting Started

## Running All with Docker Compose

From the project root directory:
```bash
# Build and start Global
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build

# View logs
# Follow all logs in real-time
docker compose logs -f

# View last 100 lines of all services
docker compose logs --tail=100

# Frontend logs (follow)
docker compose logs -f frontend

# Backend logs (follow)
docker compose logs -f backend

# Show logs with timestamps
docker compose logs -f -t backend

# PostgreSQL logs
docker compose logs -f postgres

# Stop the service
docker compose down
```

## Completed Features

### 1. Authentication API
- **POST /api/auth/register** - User registration
- **POST /api/auth/login** - User login (returns JWT token)
- **POST /api/auth/logout** - User logout

**Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- JWT token generation with configurable expiration
- Token verification middleware
- Role-based access control (user/admin)

### 2. Event Listing API
- **GET /api/events** - List all events (public, supports filtering)
- **GET /api/events/:id** - Get event by ID (public)
- **POST /api/events** - Create event (authenticated)
- **PUT /api/events/:id** - Update event (authenticated)
- **DELETE /api/events/:id** - Delete event (admin only)

**Features:**
- Filtering by status, venue, date range
- Pagination support
- Available tickets tracking
- Event status management (upcoming, live, completed, cancelled)

### 3. Ticket Purchase API
- **POST /api/events/:eventId/purchase** - Purchase tickets for an event

**Features:**
- Atomic transaction handling (prevents over-booking)
- Automatic ticket record creation
- Available tickets decrement
- Price calculation and storage
- User association

### 4. User Management API
- **GET /api/users** - List users (admin only)
- **GET /api/users/:id** - Get user by ID (self or admin)
- **POST /api/users** - Create user (admin only)
- **PUT /api/users/:id** - Update user (self or admin)
- **DELETE /api/users/:id** - Delete user (admin only)

**Features:**
- Role-based access control
- Users can manage their own profiles
- Admins have full CRUD access
- Email uniqueness validation
- Password hashing on create/update

### 5. Authentication & Authorization Middleware

**JWT-based Authentication:**
- Token verification middleware (`authenticate`)
- Token extraction from `Authorization: Bearer <token>` header
- Automatic user context injection (`req.user`)
- Token expiration handling

**Role-based Authorization:**
- `authorize(...roles)` middleware
- Support for multiple roles
- Granular permission control

**Request Extension:**
```typescript
req.user = {
  userId: number,
  email: string,
  role: 'user' | 'admin'
}
```

### 6. Database Schema

**Tables Created:**
1. **users** - User accounts with roles
2. **events** - Event listings with ticket information
3. **tickets** - Support tickets and event ticket purchases
4. **sessions** - Token management (for future blacklisting)

**Features:**
- Foreign key relationships
- Check constraints for data integrity
- Indexes for query performance
- Automatic timestamp tracking
- Cascading deletes where appropriate

### 7. Infrastructure Provisioning

**Services Provisioned:**
1. **PostgreSQL Database** - Managed with health checks
2. **Backend API** - Stateless, scalable Node.js service

**Provisioning Scripts:**
- `infra/provision.sh` - Automated provisioning with security and scalability considerations
- `infra/teardown.sh` - Safe infrastructure teardown

**Features Demonstrated:**
- **Scalability:**
  - Stateless backend design
  - Horizontal scaling support
  - Resource limits configuration
  - Load balancer ready
  
- **Security:**
  - Network isolation (Docker networks)
  - Credential management (.env with secure generation)
  - Least-privilege access patterns
  - Secure endpoints (JWT authentication)
  
- **Extensibility:**
  - Modular service architecture
  - Easy to add new services
  - Clear separation of concerns
  - Infrastructure as Code ready

  ## Security Features

1. **Password Security:**
   - bcrypt hashing (10 rounds)
   - No plaintext password storage
   - Password validation on registration

2. **Authentication:**
   - JWT tokens with expiration
   - Secure token generation
   - Token verification middleware

3. **Authorization:**
   - Role-based access control (RBAC)
   - User self-service with admin override
   - Protected endpoints

4. **Network Security:**
   - Isolated Docker networks
   - Internal service communication only
   - Limited port exposure

5. **Credential Management:**
   - Environment variables for secrets
   - Auto-generated secrets in provisioning
   - TODO: Integration with secrets management services

## Scalability Features

1. **Stateless Design:**
   - No session storage in application
   - JWT-based authentication
   - Database as single source of truth

2. **Horizontal Scaling:**
   - Multiple backend instances supported
   - Load balancer ready configuration
   - Resource limits defined

3. **Database:**
   - Connection pooling (pg pool)
   - Indexed queries
   - Transaction support for atomic operations


### Architecture Decisions

1. **JWT over Sessions:** Chosen for stateless scalability
2. **PostgreSQL:** Robust, feature-rich, supports complex queries
3. **Docker Compose:** Local development, production patterns in scripts
4. **TypeScript:** Type safety, better developer experience

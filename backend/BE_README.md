# Backend - Ticketing System API

Express.js backend with TypeScript, running in Docker.

## Running with Docker Compose

From the project root directory:

```bash
# Build and start the backend
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build

# View logs
# Follow all logs in real-time
docker compose logs -f

# View last 100 lines of all services
docker compose logs --tail=100

# Backend logs (follow)
docker compose logs -f backend

# PostgreSQL logs
docker compose logs -f postgres


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


# Show last 100 lines
docker logs ticketing-backend --tail=100

# Show with timestamps
docker logs ticketing-backend -f -t

# Stop the service
docker compose down
```

The API will be available at: `http://localhost:3000`

## Running Locally (Development)

If you want to run without Docker:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Or build and run production mode
npm run build
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.ts      # PostgreSQL connection pool
│   │   └── migrations.ts       # Database initialization
│   ├── models/
│   │   └── Ticket.ts           # Ticket types and interfaces
│   ├── services/
│   │   └── ticketService.ts    # Business logic layer
│   ├── controllers/
│   │   └── ticketController.ts # Request handlers
│   ├── routes/
│   │   └── ticketRoutes.ts     # API route definitions
│   └── index.ts                # Application entry point
├── package.json
└── tsconfig.json
```

## API Endpoints

### Health & Info
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint (includes database connection status)

### Tickets API

#### Create Ticket
```bash
POST /api/tickets
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users cannot log in with email",
  "priority": "high",
  "created_by": "john@example.com",
  "assigned_to": "dev@example.com"
}
```

#### Get Ticket by ID
```bash
GET /api/tickets/:id
```

#### List Tickets (with filters and pagination)
```bash
GET /api/tickets?status=open&priority=high&limit=10&offset=0
```

Query parameters:
- `status` - Filter by status (open, in_progress, resolved, closed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `created_by` - Filter by creator
- `assigned_to` - Filter by assignee
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

#### Update Ticket
```bash
PUT /api/tickets/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": "dev2@example.com"
}
```

#### Delete Ticket
```bash
DELETE /api/tickets/:id
```

## Ticket Model

```typescript
{
  id: number
  title: string (required)
  description?: string
  status: "open" | "in_progress" | "resolved" | "closed" (default: "open")
  priority: "low" | "medium" | "high" | "urgent" (default: "medium")
  created_by?: string
  assigned_to?: string
  created_at: Date
  updated_at: Date
}
```

## Environment Variables

Create a `.env` file in the backend directory (or use `.env.example` as template):

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticketing_db

# Or use connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_db
```

**Note:** When running with Docker Compose, these variables are automatically set. You only need to configure them when running locally.

## Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/

# Create a ticket
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix critical bug",
    "description": "Application crashes on startup",
    "priority": "urgent",
    "created_by": "user@example.com"
  }'

# List all tickets
curl http://localhost:3000/api/tickets

# Get ticket by ID
curl http://localhost:3000/api/tickets/1

# Update ticket
curl -X PUT http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assigned_to": "dev@example.com"
  }'

# Delete ticket
curl -X DELETE http://localhost:3000/api/tickets/1

# Filter tickets
curl "http://localhost:3000/api/tickets?status=open&priority=high&limit=10"
```

## Database

The application uses PostgreSQL. When running with Docker Compose, the database is automatically set up and initialized.

### Database Schema

The `tickets` table is automatically created on startup with the following structure:
- `id` - Primary key (auto-increment)
- `title` - Ticket title (required)
- `description` - Ticket description (optional)
- `status` - Ticket status (open, in_progress, resolved, closed)
- `priority` - Priority level (low, medium, high, urgent)
- `created_by` - Creator identifier
- `assigned_to` - Assignee identifier
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

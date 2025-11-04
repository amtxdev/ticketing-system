# Postman Collection - Ticketing System API

## 📦 Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Ticketing-System-API.postman_collection.json`
4. The collection will be imported with all endpoints organized by category

## Configuration

### Collection Variables

The collection uses the following variables (automatically set or can be configured):

- `base_url`: API base URL (default: `http://localhost:3000`)
- `auth_token`: JWT token (automatically saved after login)
- `user_id`: Current user ID (automatically saved after login)
- `user_role`: Current user role (automatically saved after login)
- `admin_registration_secret`: Admin registration secret (if configured)

### Setup Instructions

1. **Set Base URL** (if different from default):
   - Click on collection name
   - Go to "Variables" tab
   - Update `base_url` value

2. **Set Admin Secret** (if using admin registration):
   - Add `admin_registration_secret` variable value
   - Or set `ADMIN_REGISTRATION_SECRET` environment variable

## API Endpoints

### 1. Health & Info
- **GET** `/health` - Health check
- **GET** `/` - API information

### 2. Authentication
- **POST** `/api/auth/register` - Register new user (public)
- **POST** `/api/auth/register-admin` - Register admin (requires secret)
- **POST** `/api/auth/login` - Login (saves token automatically)
- **POST** `/api/auth/logout` - Logout (requires auth)

### 3. Users
All user endpoints require authentication:
- **GET** `/api/users` - List users (admin only)
- **GET** `/api/users/:id` - Get user (own profile or admin)
- **POST** `/api/users` - Create user (admin only)
- **PUT** `/api/users/:id` - Update user (own profile or admin)
- **DELETE** `/api/users/:id` - Delete user (admin only)

### 4. Events
- **GET** `/api/events` - List events (public)
- **GET** `/api/events/:id` - Get event (public)
- **POST** `/api/events` - Create event (admin only)
- **PUT** `/api/events/:id` - Update event (admin only)
- **DELETE** `/api/events/:id` - Delete event (admin only)
- **POST** `/api/events/:eventId/purchase` - Purchase tickets (requires auth)

### 5. Tickets
All ticket endpoints require authentication:
- **GET** `/api/tickets` - List tickets (own tickets or all if admin)
- **GET** `/api/tickets/:id` - Get ticket (own ticket or any if admin)
- **POST** `/api/tickets` - Create ticket
- **PUT** `/api/tickets/:id` - Update ticket (admin only)
- **DELETE** `/api/tickets/:id` - Delete ticket (admin only)

## Quick Start

### Step 1: Login
1. Use **Login** request in Authentication folder
2. Update email/password if needed
3. Send request
4. Token is automatically saved to `auth_token` variable

### Step 2: Use Authenticated Endpoints
- All authenticated endpoints will automatically use the saved token
- No need to manually add Authorization header

### Step 3: Test Public Endpoints
- Events list and details are public (no auth needed)
- Try listing events without logging in

## Example Usage Flow

1. **Register a user**:
   ```
   POST /api/auth/register
   Body: { email, password, first_name, last_name }
   ```

2. **Login**:
   ```
   POST /api/auth/login
   Body: { email, password }
   → Token saved automatically
   ```

3. **View events** (public):
   ```
   GET /api/events
   → No auth needed
   ```

4. **Purchase tickets**:
   ```
   POST /api/events/1/purchase
   Body: { quantity: 2 }
   → Requires auth (token used automatically)
   ```

5. **View your tickets**:
   ```
   GET /api/tickets
   → Shows only your tickets
   ```

## Authentication

- Most endpoints require JWT token in `Authorization` header
- Format: `Bearer <token>`
- Token is automatically added after login via collection variable
- Public endpoints: Health check, Root, Events list/details

## Role-Based Access

- **Public**: Anyone can access
- **User**: Authenticated users can access
- **Admin**: Only admins can access

## Response Formats

All endpoints return JSON with consistent structure:

**Success Response**:
```json
{
  "message": "Success message",
  "data": { ... },
  "meta": { ... }  // For paginated responses
}
```

**Error Response**:
```json
{
  "error": "Error type",
  "message": "Error message"
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP (stricter)

## Testing Tips

1. **Start with public endpoints** (events list) to verify API is running
2. **Register a user** before testing authenticated endpoints
3. **Login** to get token (automatically saved)
4. **Use admin credentials** for admin-only endpoints:
   - Default admin: `admin@example.com` / `admin123`
5. **Test authorization** by trying to access admin endpoints with regular user

## Collection Structure

```
Ticketing System API
├── Health & Info
│   ├── Health Check
│   └── Root Endpoint
├── Authentication
│   ├── Register User
│   ├── Register Admin
│   ├── Login (auto-saves token)
│   └── Logout
├── Users
│   ├── List Users (admin)
│   ├── Get User by ID
│   ├── Create User (admin)
│   ├── Update User
│   └── Delete User (admin)
├── Events
│   ├── List Events (public)
│   ├── Get Event by ID (public)
│   ├── Create Event (admin)
│   ├── Update Event (admin)
│   ├── Delete Event (admin)
│   └── Purchase Tickets (auth)
└── Tickets
    ├── List Tickets
    ├── Get Ticket by ID
    ├── Create Ticket
    ├── Update Ticket (admin)
    └── Delete Ticket (admin)
```

## Updating Variables

After login, these variables are automatically set:
- `auth_token` - Your JWT token
- `user_id` - Your user ID
- `user_role` - Your role (user/admin)

You can manually update `user_id` in requests if needed.


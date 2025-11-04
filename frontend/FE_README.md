# Frontend - Ticketing System

React + TypeScript frontend built with Vite for the Ticketing System application.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.tsx    # Route guard for protected pages
│   ├── context/              # React context providers
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── pages/                # Page-level components
│   │   ├── LoginPage.tsx         # Login page (public)
│   │   ├── EventsPage.tsx        # Event listing (public)
│   │   └── PurchasePage.tsx      # Ticket purchase (protected)
│   ├── services/             # API service layer
│   │   ├── apiClient.ts          # Axios instance with interceptors
│   │   ├── authService.ts        # Authentication API calls
│   │   └── eventService.ts       # Events API calls
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   ├── apiConfig.ts          # API endpoint configuration
│   │   └── tokenStorage.ts       # Token storage helpers
│   ├── App.tsx               # Main app component with routing
│   └── main.tsx              # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Features

### Authentication
- **Login Flow**: User authentication with email/password
- **Token Storage**: JWT tokens stored in localStorage
- **Session Management**: Auth state persisted across page refreshes
- **Auto-logout**: Handles token expiration (401 responses)

### Access Control
- **Protected Routes**: `/purchase/:eventId` requires authentication
- **Route Guards**: Automatic redirect to login for unauthenticated users
- **Role-based UI**: Conditional rendering based on user role (admin/user)
- **Public Routes**: `/events` and `/login` accessible without auth

### API Integration
- **Centralized Client**: Axios instance with interceptors for token injection
- **Error Handling**: Consistent error handling across API calls
- **Type Safety**: Full TypeScript support for API requests/responses

## Setup & Development

### Prerequisites
- Node.js 18+ and npm
- Backend API running (default: `http://localhost:3000`)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the `frontend/` directory:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3000/api
```

If not set, defaults to `http://localhost:3000/api`.

### Development Server

```bash
# Start development server (with hot reload)
npm run dev
```

The app will be available at `http://localhost:3001` (configured in `vite.config.ts`).

### Linting

```bash
# Run ESLint
npm run lint
```

## Build & Deployment

### Production Build

```bash
# Build for production
npm run build
```

This command:
1. Runs TypeScript type checking (`tsc`)
2. Builds the application with Vite
3. Outputs production-ready assets to `dist/` directory

The `dist/` folder contains:
- `index.html` - Entry HTML file
- `assets/` - Optimized JavaScript, CSS, and other static assets

### Preview Production Build Locally

```bash
# Preview the production build
npm run preview
```

This serves the `dist/` folder locally for testing the production build.

### Deployment Options

The `dist/` folder can be deployed to any static file hosting service:

**Static Hosting Services:**
- **Vercel**: Connect your Git repository, set build command to `npm run build`, output directory to `dist`
- **Netlify**: Connect repository, build command `npm run build`, publish directory `dist`
- **AWS S3 + CloudFront**: Upload `dist/` contents to S3 bucket, configure CloudFront distribution
- **GitHub Pages**: Build and push `dist/` contents to `gh-pages` branch
- **Nginx/Apache**: Copy `dist/` contents to web server document root

**Example deployment commands:**

```bash
# Build
npm run build

# The dist/ folder is now ready for deployment
# Copy contents to your hosting service of choice
```

**Environment Variables in Production:**
- Set `VITE_API_BASE_URL` to your production backend API URL during build
- Or configure via your hosting platform's environment variable settings

## API Integration

### Backend Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/events` - List all events (public)
- `GET /api/events/:id` - Get event details (public)
- `POST /api/events/:eventId/purchase` - Purchase tickets (protected)

### Authentication Flow

1. User submits login form with email/password
2. Frontend calls `authService.login()`
3. Backend returns JWT token and user data
4. Token stored in localStorage via `tokenStorage`
5. User data stored in AuthContext
6. Subsequent API requests include token in `Authorization: Bearer <token>` header
7. On 401 response, token is cleared and user redirected to login

### Access Control Implementation

**Protected Routes:**
```tsx
<Route
  path="/purchase/:eventId"
  element={
    <ProtectedRoute>
      <PurchasePage />
    </ProtectedRoute>
  }
/>
```

**Role-based UI:**
```tsx
const { isAdmin } = useAuth();
{isAdmin() && <AdminPanel />}
```

## Pages Overview

### Login Page (`/login`)
- Public route
- Email/password form
- Stores token and user data on success
- Redirects to intended page or `/events`

### Events Page (`/events`)
- Public route
- Lists all available events
- Shows login status and user role
- Purchase buttons visible only when authenticated
- "Login to purchase" prompt for unauthenticated users

### Purchase Page (`/purchase/:eventId`)
- Protected route (requires authentication)
- Displays event details
- Quantity selector for tickets
- Purchase form with validation
- Redirects to login if accessed without auth

## Development Notes

### Stubbed/Pseudocode Areas

- **Registration**: Registration page is referenced but not fully implemented
- **Error Recovery**: Basic error handling implemented; advanced retry logic can be added
- **Loading States**: Simple loading indicators; can be enhanced with skeleton screens
- **Form Validation**: Basic HTML5 validation; can be extended with form libraries
- **UI Polish**: Minimal styling for structure clarity; ready for design system integration

### Future Enhancements

- Add React Query or SWR for advanced data fetching/caching
- Implement refresh token rotation
- Add unit tests (Vitest) and E2E tests (Playwright/Cypress)
- Integrate form validation library (React Hook Form, Formik)
- Add toast notifications for user feedback
- Implement optimistic UI updates
- Add pagination for events list
- Add search and filtering for events

## Troubleshooting

### CORS Issues
Ensure backend CORS is configured to allow requests from `http://localhost:3001`.

### API Connection Errors
- Verify backend is running on the configured port (default: 3000)
- Check `VITE_API_BASE_URL` in `.env` file
- Verify network connectivity between frontend and backend

### Authentication Issues
- Clear localStorage if token appears invalid: `localStorage.clear()`
- Check browser console for API error messages
- Verify JWT token format in Network tab

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build` will show type errors
- Verify Node.js version compatibility (18+)

## Single Command Setup

For new developers, the entire setup can be done with:

```bash
cd frontend && npm install && npm run dev
```

This will:
1. Install all dependencies
2. Start the development server
3. Open `http://localhost:3001` in browser (with backend running)
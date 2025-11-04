import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { testConnection } from "./db/connection";
import { initializeDatabase } from "./db/migrations";
import { seedAll } from "./db/seed";
import { SessionService } from "./services/sessionService";
import ticketRoutes from "./routes/ticketRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BE_PORT;

// Security middleware - helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow external resources if needed
}));

// CORS configuration - restrict to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:5173", // Vite default
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) in development
      if (!origin && process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting - general API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use(generalLimiter);

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: dbConnected ? "ok" : "degraded",
    message: "Ticketing System API is running",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    message: "Ticketing System API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      events: "/api/events",
      tickets: "/api/tickets"
    }
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message || "An unexpected error occurred",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error("Failed to connect to database. Retrying...");
      // In production, you might want to retry or exit
    }

    // Initialize database tables
    await initializeDatabase();

    // Seed database (admin, users, events, tickets)
    await seedAll();

    // Start cleanup job for expired sessions
    const sessionService = new SessionService();
    const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
    
    const cleanupExpiredSessions = async () => {
      try {
        const deletedCount = await sessionService.cleanupExpiredSessions();
        if (deletedCount > 0) {
          console.log(`Cleaned up ${deletedCount} expired sessions`);
        }
      } catch (error) {
        console.error("Error cleaning up expired sessions:", error);
      }
    };

    // Run cleanup immediately on startup
    cleanupExpiredSessions();

    // Schedule cleanup to run every hour
    setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base: http://localhost:${PORT}/api`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
      console.log(`Events API: http://localhost:${PORT}/api/events`);
      console.log(`Tickets API: http://localhost:${PORT}/api/tickets`);
      console.log(`Session cleanup job: running every ${CLEANUP_INTERVAL / 1000 / 60} minutes`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
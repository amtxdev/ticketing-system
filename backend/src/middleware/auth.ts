import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload, AuthPayload } from "../models/Auth";
import { SessionService } from "../services/sessionService";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is required!");
  console.error("Please set JWT_SECRET in your .env file or environment variables.");
  process.exit(1);
}

// Type assertion after validation - we know JWT_SECRET is not undefined
const JWT_SECRET_VALIDATED: string = JWT_SECRET;

/**
 * Authentication middleware - verifies JWT token and checks blacklist
 * Wrapped to handle async operations properly in Express
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          error: "Unauthorized",
          message: "No token provided",
        });
        return;
      }

      const token = authHeader.startsWith("Bearer ") 
        ? authHeader.substring(7) 
        : authHeader;

      if (!token) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid token format",
        });
        return;
      }

      // Verify token signature and expiration
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, JWT_SECRET_VALIDATED) as JwtPayload;
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          res.status(401).json({
            error: "Unauthorized",
            message: "Token expired",
          });
          return;
        }

        if (error.name === "JsonWebTokenError") {
          res.status(401).json({
            error: "Unauthorized",
            message: "Invalid token",
          });
          return;
        }

        throw error;
      }

      // Check if token is blacklisted (revoked)
      const sessionService = new SessionService();
      const isValid = await sessionService.isTokenValid(token);
      
      if (!isValid) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Token has been revoked",
        });
        return;
      }

      // Update last_used_at timestamp
      await sessionService.updateLastUsed(token);

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal server error",
          message: "Token verification failed",
        });
      }
    }
  })();
}

/**
 * Authorization middleware - checks if user has required role
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
}

/**
 * Generate JWT token
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET_VALIDATED,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions
  );
}

export { JWT_SECRET_VALIDATED as JWT_SECRET, JWT_EXPIRES_IN };


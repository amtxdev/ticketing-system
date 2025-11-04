import bcrypt from "bcryptjs";
import { Request } from "express";
import { pool } from "../db/connection";
import { RegisterDto, LoginDto, User } from "../models/User";
import { generateToken, JWT_EXPIRES_IN } from "../middleware/auth";
import { AuthPayload } from "../models/Auth";
import { SessionService } from "./sessionService";

export class AuthService {
  private sessionService = new SessionService();

  /**
   * Extract device info and IP from request
   */
  private getDeviceInfo(req?: Request): { device_info?: string; ip_address?: string } {
    if (!req) {
      return {};
    }

    const deviceInfo = req.headers["user-agent"] || undefined;
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      undefined;

    return {
      device_info: deviceInfo,
      ip_address: ipAddress,
    };
  }

  /**
   * Calculate expiration date from JWT_EXPIRES_IN
   */
  private getExpirationDate(): Date {
    const expiresIn = JWT_EXPIRES_IN;
    const now = new Date();

    if (expiresIn.endsWith("d")) {
      const days = parseInt(expiresIn.slice(0, -1));
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    } else if (expiresIn.endsWith("h")) {
      const hours = parseInt(expiresIn.slice(0, -1));
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    } else if (expiresIn.endsWith("m")) {
      const minutes = parseInt(expiresIn.slice(0, -1));
      return new Date(now.getTime() + minutes * 60 * 1000);
    } else if (expiresIn.endsWith("s")) {
      const seconds = parseInt(expiresIn.slice(0, -1));
      return new Date(now.getTime() + seconds * 1000);
    }

    // Default to 7 days if format is unknown
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  async register(data: RegisterDto, req?: Request): Promise<{ user: Omit<User, "password_hash">; token: string }> {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [data.email, passwordHash, data.first_name || null, data.last_name || null]
    );

    const user = result.rows[0];

    // Generate token
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || "user",
    };

    const token = generateToken(payload);

    // Create session record
    const deviceInfo = this.getDeviceInfo(req);
    const expiresAt = this.getExpirationDate();
    await this.sessionService.createSession({
      user_id: user.id,
      token_hash: token,
      expires_at: expiresAt,
      ...deviceInfo,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  async registerAdmin(data: RegisterDto, req?: Request): Promise<{ user: Omit<User, "password_hash">; token: string }> {
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role = 'admin'",
      [data.email]
    );

    if (existingAdmin.rows.length > 0) {
      throw new Error("Admin with this email already exists");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [data.email, passwordHash, data.first_name || null, data.last_name || null]
    );

    const user = result.rows[0];

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || "admin",
    };

    const token = generateToken(payload);

    // Create session record
    const deviceInfo = this.getDeviceInfo(req);
    const expiresAt = this.getExpirationDate();
    await this.sessionService.createSession({
      user_id: user.id,
      token_hash: token,
      expires_at: expiresAt,
      ...deviceInfo,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  async login(data: LoginDto, req?: Request): Promise<{ user: Omit<User, "password_hash">; token: string }> {
    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new Error("User account is inactive");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || "user",
    };

    const token = generateToken(payload);

    // Create session record
    const deviceInfo = this.getDeviceInfo(req);
    const expiresAt = this.getExpirationDate();
    await this.sessionService.createSession({
      user_id: user.id,
      token_hash: token,
      expires_at: expiresAt,
      ...deviceInfo,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  async logout(token: string): Promise<void> {
    // Revoke the token (blacklist it)
    await this.sessionService.revokeToken(token);
  }

  /**
   * Revoke all sessions for a user (logout from all devices)
   */
  async logoutAll(userId: number): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
  }
}


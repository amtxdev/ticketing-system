import bcrypt from "bcryptjs";
import { pool } from "../db/connection";
import { RegisterDto, LoginDto, User } from "../models/User";
import { generateToken } from "../middleware/auth";
import { AuthPayload } from "../models/Auth";

export class AuthService {
  async register(data: RegisterDto): Promise<{ user: Omit<User, "password_hash">; token: string }> {
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

  async login(data: LoginDto): Promise<{ user: Omit<User, "password_hash">; token: string }> {
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
    // In a production system, you might want to blacklist the token
    // For now, we'll just return success
    // TODO: Implement token blacklisting using sessions table
    return Promise.resolve();
  }
}


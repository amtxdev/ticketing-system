import bcrypt from "bcryptjs";
import { pool } from "../db/connection";
import { User, CreateUserDto, UpdateUserDto, UserQueryParams } from "../models/User";

export class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
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
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [
        data.email,
        passwordHash,
        data.first_name || null,
        data.last_name || null,
        data.role || "user",
      ]
    );

    return result.rows[0];
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  async listUsers(params: UserQueryParams = {}): Promise<{ users: User[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.role) {
      conditions.push(`role = $${paramIndex}`);
      values.push(params.role);
      paramIndex++;
    }

    if (params.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      values.push(params.is_active);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      users: result.rows,
      total,
    };
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [data.email, id]
      );

      if (existingUser.rows.length > 0) {
        throw new Error("Email already taken by another user");
      }

      updates.push(`email = $${paramIndex}`);
      values.push(data.email);
      paramIndex++;
    }

    if (data.password !== undefined) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    if (data.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(data.first_name);
      paramIndex++;
    }

    if (data.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(data.last_name);
      paramIndex++;
    }

    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      values.push(data.role);
      paramIndex++;
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(data.is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.getUserById(id);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}


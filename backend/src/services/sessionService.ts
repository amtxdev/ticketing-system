import crypto from "crypto";
import { pool } from "../db/connection";
import { Session, CreateSessionDto } from "../models/Session";

export class SessionService {
  /**
   * Hash a JWT token for storage
   * Uses SHA-256 to create a hash of the token
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Create a new session record
   */
  async createSession(data: CreateSessionDto): Promise<Session> {
    const query = `
      INSERT INTO sessions (user_id, token_hash, expires_at, device_info, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const tokenHash = this.hashToken(data.token_hash);
    const values = [
      data.user_id,
      tokenHash,
      data.expires_at,
      data.device_info || null,
      data.ip_address || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find a session by token hash
   */
  async findSessionByToken(token: string): Promise<Session | null> {
    const tokenHash = this.hashToken(token);
    const query = `
      SELECT * FROM sessions
      WHERE token_hash = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [tokenHash]);
    return result.rows[0] || null;
  }

  /**
   * Check if a token is revoked or expired
   */
  async isTokenValid(token: string): Promise<boolean> {
    const session = await this.findSessionByToken(token);

    if (!session) {
      return false; // Session not found
    }

    if (session.is_revoked) {
      return false; // Token was revoked
    }

    // Check if token is expired
    const now = new Date();
    if (session.expires_at < now) {
      return false; // Token expired
    }

    return true;
  }

  /**
   * Revoke a token (blacklist it)
   */
  async revokeToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const query = `
      UPDATE sessions
      SET is_revoked = true, revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1 AND is_revoked = false
      RETURNING id
    `;

    const result = await pool.query(query, [tokenHash]);
    return result.rows.length > 0;
  }

  /**
   * Revoke all sessions for a user (useful for logout all devices)
   */
  async revokeAllUserSessions(userId: number): Promise<number> {
    const query = `
      UPDATE sessions
      SET is_revoked = true, revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_revoked = false
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * Update last_used_at timestamp for a session
   */
  async updateLastUsed(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const query = `
      UPDATE sessions
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1 AND is_revoked = false
    `;

    await pool.query(query, [tokenHash]);
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const query = `
      DELETE FROM sessions
      WHERE expires_at < CURRENT_TIMESTAMP
      OR (is_revoked = true AND revoked_at < CURRENT_TIMESTAMP - INTERVAL '30 days')
      RETURNING id
    `;

    const result = await pool.query(query);
    return result.rowCount || 0;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number): Promise<Session[]> {
    const query = `
      SELECT * FROM sessions
      WHERE user_id = $1 AND is_revoked = false AND expires_at > CURRENT_TIMESTAMP
      ORDER BY last_used_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}


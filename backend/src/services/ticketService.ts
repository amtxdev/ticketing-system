import { pool } from "../db/connection";
import { Ticket, CreateTicketDto, UpdateTicketDto, TicketQueryParams } from "../models/Ticket";

export class TicketService {
  async createTicket(data: CreateTicketDto): Promise<Ticket> {
    const query = `
      INSERT INTO tickets (title, description, priority, created_by, assigned_to)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      data.title,
      data.description || null,
      data.priority || "medium",
      data.created_by || null,
      data.assigned_to || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    const query = `SELECT * FROM tickets WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async listTickets(params: TicketQueryParams = {}): Promise<{ tickets: Ticket[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Filter by user_id if provided (for non-admin users)
    if (params.user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      values.push(params.user_id);
      paramIndex++;
    }

    if (params.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    if (params.priority) {
      conditions.push(`priority = $${paramIndex}`);
      values.push(params.priority);
      paramIndex++;
    }

    if (params.created_by) {
      conditions.push(`created_by = $${paramIndex}`);
      values.push(params.created_by);
      paramIndex++;
    }

    if (params.assigned_to) {
      conditions.push(`assigned_to = $${paramIndex}`);
      values.push(params.assigned_to);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM tickets ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    const query = `
      SELECT * FROM tickets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      tickets: result.rows,
      total,
    };
  }

  async updateTicket(id: number, data: UpdateTicketDto): Promise<Ticket | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }

    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      values.push(data.priority);
      paramIndex++;
    }

    if (data.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      values.push(data.assigned_to);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.getTicketById(id);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE tickets
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteTicket(id: number): Promise<boolean> {
    const query = `DELETE FROM tickets WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}


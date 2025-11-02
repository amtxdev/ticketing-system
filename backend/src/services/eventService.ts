import { pool } from "../db/connection";
import { Event, CreateEventDto, UpdateEventDto, EventQueryParams } from "../models/Event";

export class EventService {
  async createEvent(data: CreateEventDto, createdBy?: number): Promise<Event> {
    const query = `
      INSERT INTO events (title, description, venue, event_date, total_tickets, available_tickets, price, image_url, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.title,
      data.description || null,
      data.venue || null,
      data.event_date,
      data.total_tickets,
      data.price,
      data.image_url || null,
      data.status || "upcoming",
      createdBy || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getEventById(id: number): Promise<Event | null> {
    const query = `SELECT * FROM events WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async listEvents(params: EventQueryParams = {}): Promise<{ events: Event[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    if (params.venue) {
      conditions.push(`venue = $${paramIndex}`);
      values.push(params.venue);
      paramIndex++;
    }

    if (params.from_date) {
      conditions.push(`event_date >= $${paramIndex}`);
      values.push(params.from_date);
      paramIndex++;
    }

    if (params.to_date) {
      conditions.push(`event_date <= $${paramIndex}`);
      values.push(params.to_date);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM events ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const query = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY event_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      events: result.rows,
      total,
    };
  }

  async updateEvent(id: number, data: UpdateEventDto): Promise<Event | null> {
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

    if (data.venue !== undefined) {
      updates.push(`venue = $${paramIndex}`);
      values.push(data.venue);
      paramIndex++;
    }

    if (data.event_date !== undefined) {
      updates.push(`event_date = $${paramIndex}`);
      values.push(data.event_date);
      paramIndex++;
    }

    if (data.total_tickets !== undefined) {
      // Get current total_tickets first to calculate available_tickets adjustment
      const currentEvent = await this.getEventById(id);
      if (!currentEvent) {
        throw new Error("Event not found");
      }
      
      const currentTotal = currentEvent.total_tickets;
      const currentAvailable = currentEvent.available_tickets;
      const newTotal = data.total_tickets;
      const adjustment = newTotal - currentTotal;
      const newAvailable = Math.max(0, currentAvailable + adjustment);
      
      updates.push(`total_tickets = $${paramIndex}`);
      values.push(newTotal);
      paramIndex++;
      
      updates.push(`available_tickets = $${paramIndex}`);
      values.push(newAvailable);
      paramIndex++;
    }

    if (data.available_tickets !== undefined) {
      updates.push(`available_tickets = $${paramIndex}`);
      values.push(data.available_tickets);
      paramIndex++;
    }

    if (data.price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(data.price);
      paramIndex++;
    }

    if (data.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex}`);
      values.push(data.image_url);
      paramIndex++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.getEventById(id);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE events
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM events WHERE id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async purchaseTickets(eventId: number, quantity: number, userId: number): Promise<Event> {
    // Start transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get event with lock
      const eventResult = await client.query(
        "SELECT * FROM events WHERE id = $1 FOR UPDATE",
        [eventId]
      );

      if (eventResult.rows.length === 0) {
        throw new Error("Event not found");
      }

      const event = eventResult.rows[0];

      // Check availability
      if (event.available_tickets < quantity) {
        throw new Error(`Not enough tickets available. Available: ${event.available_tickets}, Requested: ${quantity}`);
      }

      if (event.status !== "upcoming" && event.status !== "live") {
        throw new Error(`Cannot purchase tickets for ${event.status} event`);
      }

      // Update available tickets
      const newAvailable = event.available_tickets - quantity;
      await client.query(
        "UPDATE events SET available_tickets = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [newAvailable, eventId]
      );

      // Create ticket records
      for (let i = 0; i < quantity; i++) {
        await client.query(
          `INSERT INTO tickets (event_id, user_id, title, status, ticket_type, quantity, purchase_price, purchase_date)
           VALUES ($1, $2, $3, 'purchased', 'event', 1, $4, CURRENT_TIMESTAMP)`,
          [eventId, userId, `${event.title} - Ticket ${i + 1}`, event.price]
        );
      }

      await client.query("COMMIT");

      // Return updated event
      const updatedEvent = await this.getEventById(eventId);
      return updatedEvent!;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}


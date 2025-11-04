import { pool } from "./connection";

export async function initializeDatabase(): Promise<void> {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        venue VARCHAR(255),
        event_date TIMESTAMP NOT NULL,
        total_tickets INTEGER NOT NULL CHECK (total_tickets >= 0),
        available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        image_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update tickets table to support event-based tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'purchased', 'cancelled')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        ticket_type VARCHAR(50) DEFAULT 'support' CHECK (ticket_type IN ('support', 'event')),
        quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
        purchase_price DECIMAL(10, 2),
        purchase_date TIMESTAMP,
        created_by VARCHAR(255),
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for token management and blacklisting
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT false,
        revoked_at TIMESTAMP,
        device_info TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to sessions table if they don't exist (for existing tables)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='sessions' AND column_name='is_revoked') THEN
          ALTER TABLE sessions ADD COLUMN is_revoked BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='sessions' AND column_name='revoked_at') THEN
          ALTER TABLE sessions ADD COLUMN revoked_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='sessions' AND column_name='device_info') THEN
          ALTER TABLE sessions ADD COLUMN device_info TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='sessions' AND column_name='ip_address') THEN
          ALTER TABLE sessions ADD COLUMN ip_address VARCHAR(45);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='sessions' AND column_name='last_used_at') THEN
          ALTER TABLE sessions ADD COLUMN last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON tickets(ticket_type)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_is_revoked ON sessions(is_revoked)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id_revoked ON sessions(user_id, is_revoked)
    `);

    // Note: Default admin user will be created on first run via a separate script
    // Password for default admin: admin123 (bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
    // TODO: In production, change default admin password immediately

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}


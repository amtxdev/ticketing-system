import bcrypt from "bcryptjs";
import { pool } from "./connection";

export async function seedDefaultAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate environment variables
    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set");
      throw new Error("Admin credentials not configured");
    }

    // Check if admin with correct email already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND role = 'admin'",
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      // Update password in case it was set incorrectly before
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2 AND role = 'admin'",
        [passwordHash, adminEmail]
      );
      console.log(`Default admin user already exists with email: ${adminEmail}`);
      console.log(`Password has been updated`);
      return;
    }

    // Check for and remove any admin with "undefined" email (from previous incorrect seeding)
    const undefinedAdmin = await pool.query(
      "SELECT id FROM users WHERE email = 'undefined' AND role = 'admin'"
    );

    if (undefinedAdmin.rows.length > 0) {
      console.log("Found admin user with 'undefined' email, removing it...");
      await pool.query(
        "DELETE FROM users WHERE email = 'undefined' AND role = 'admin'"
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminEmail, passwordHash, "Admin", "User", "admin"]
    );

    console.log("Default admin user created");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("WARNING: Change this password in production!");
  } catch (error) {
    console.error("Error seeding default admin:", error);
    throw error;
  }
}

export async function seedEvents(): Promise<void> {
  try {
    // Get admin user ID
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (adminResult.rows.length === 0) {
      console.log("No admin user found. Please seed admin user first.");
      return;
    }

    const adminId = adminResult.rows[0].id;

    // Check if events already exist
    const existingEvents = await pool.query("SELECT id FROM events LIMIT 1");

    if (existingEvents.rows.length > 0) {
      console.log("Events already seeded");
      return;
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const events = [
      {
        title: "Summer Music Festival 2024",
        description: "Join us for an amazing outdoor music festival featuring top artists from around the world. Food vendors, art installations, and camping available.",
        venue: "Central Park, New York",
        event_date: nextWeek.toISOString(),
        total_tickets: 5000,
        available_tickets: 3200,
        price: 89.99,
        image_url: "https://example.com/images/summer-festival.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Tech Conference 2024",
        description: "Annual technology conference covering AI, cloud computing, cybersecurity, and software development. Networking sessions and workshops included.",
        venue: "Convention Center, San Francisco",
        event_date: tomorrow.toISOString(),
        total_tickets: 2000,
        available_tickets: 850,
        price: 299.00,
        image_url: "https://example.com/images/tech-conference.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Jazz Night Live",
        description: "Intimate jazz performance featuring local and international jazz musicians. Includes dinner and drinks.",
        venue: "Blue Note Jazz Club, Manhattan",
        event_date: now.toISOString(),
        total_tickets: 150,
        available_tickets: 45,
        price: 125.00,
        image_url: "https://example.com/images/jazz-night.jpg",
        status: "live",
        created_by: adminId
      },
      {
        title: "Marathon 2024",
        description: "Annual city marathon with 10K, half-marathon, and full marathon options. Early bird registration discounts available.",
        venue: "Central Park, New York",
        event_date: lastMonth.toISOString(),
        total_tickets: 10000,
        available_tickets: 0,
        price: 75.00,
        image_url: "https://example.com/images/marathon.jpg",
        status: "completed",
        created_by: adminId
      },
      {
        title: "Comedy Show - Cancelled",
        description: "Stand-up comedy night featuring renowned comedians. Due to unforeseen circumstances, this event has been cancelled.",
        venue: "Comedy Club, Brooklyn",
        event_date: lastWeek.toISOString(),
        total_tickets: 300,
        available_tickets: 300,
        price: 45.00,
        image_url: "https://example.com/images/comedy-show.jpg",
        status: "cancelled",
        created_by: adminId
      },
      {
        title: "Art Exhibition: Modern Masters",
        description: "Exhibition showcasing works from contemporary artists. Guided tours available. Limited capacity.",
        venue: "Metropolitan Museum of Art, New York",
        event_date: nextWeek.toISOString(),
        total_tickets: 500,
        available_tickets: 312,
        price: 35.00,
        image_url: "https://example.com/images/art-exhibition.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Food & Wine Festival",
        description: "Celebrate culinary excellence with tastings from top restaurants, wine pairings, and cooking demonstrations.",
        venue: "Pier 57, Manhattan",
        event_date: nextWeek.toISOString(),
        total_tickets: 1000,
        available_tickets: 678,
        price: 95.00,
        image_url: "https://example.com/images/food-wine.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Basketball Championship Finals",
        description: "Watch the championship finals live at the arena. VIP packages with meet-and-greet available.",
        venue: "Madison Square Garden, New York",
        event_date: tomorrow.toISOString(),
        total_tickets: 18000,
        available_tickets: 1200,
        price: 150.00,
        image_url: "https://example.com/images/basketball-finals.jpg",
        status: "upcoming",
        created_by: adminId
      }
    ];

    for (const event of events) {
      await pool.query(
        `INSERT INTO events (title, description, venue, event_date, total_tickets, available_tickets, price, image_url, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          event.title,
          event.description,
          event.venue,
          event.event_date,
          event.total_tickets,
          event.available_tickets,
          event.price,
          event.image_url,
          event.status,
          event.created_by
        ]
      );
    }

    console.log(`Seeded ${events.length} events successfully`);
  } catch (error) {
    console.error("Error seeding events:", error);
    throw error;
  }
}

export async function seedTickets(): Promise<void> {
  try {
    // Get admin user ID
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (adminResult.rows.length === 0) {
      console.log("No admin user found. Please seed admin user first.");
      return;
    }

    const adminId = adminResult.rows[0].id;

    // Get some regular users (if they exist)
    const usersResult = await pool.query(
      "SELECT id FROM users WHERE role = 'user' LIMIT 3"
    );
    const userIds = usersResult.rows.map(row => row.id);

    // Get events
    const eventsResult = await pool.query(
      "SELECT id, title, price, status FROM events WHERE status IN ('upcoming', 'live') ORDER BY id LIMIT 5"
    );

    if (eventsResult.rows.length === 0) {
      console.log("No events found. Please seed events first.");
      return;
    }

    // Check if tickets already exist
    const existingTickets = await pool.query("SELECT id FROM tickets LIMIT 1");

    if (existingTickets.rows.length > 0) {
      console.log("Tickets already seeded");
      return;
    }

    const tickets = [];

    // Create event tickets (purchased tickets)
    const event1 = eventsResult.rows[0];
    const event2 = eventsResult.rows.length > 1 ? eventsResult.rows[1] : null;
    const event3 = eventsResult.rows.length > 2 ? eventsResult.rows[2] : null;

    if (userIds.length > 0 && event1) {
      // User 1 purchases tickets for event 1
      tickets.push({
        event_id: event1.id,
        user_id: userIds[0],
        title: `${event1.title} - Ticket`,
        description: `Purchased ticket for ${event1.title}`,
        status: "purchased",
        priority: "medium",
        ticket_type: "event",
        quantity: 2,
        purchase_price: event1.price,
        purchase_date: new Date().toISOString(),
        created_by: userIds[0].toString()
      });

      // User 1 purchases tickets for event 2 (if exists)
      if (event2 && userIds.length > 0) {
        tickets.push({
          event_id: event2.id,
          user_id: userIds[0],
          title: `${event2.title} - Ticket`,
          description: `Purchased ticket for ${event2.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: event2.price,
          purchase_date: new Date().toISOString(),
          created_by: userIds[0].toString()
        });
      }
    }

    if (userIds.length > 1 && event1) {
      // User 2 purchases tickets
      tickets.push({
        event_id: event1.id,
        user_id: userIds[1],
        title: `${event1.title} - Ticket`,
        description: `Purchased ticket for ${event1.title}`,
        status: "purchased",
        priority: "medium",
        ticket_type: "event",
        quantity: 3,
        purchase_price: event1.price,
        purchase_date: new Date().toISOString(),
        created_by: userIds[1].toString()
      });
    }

    if (userIds.length > 2 && event3) {
      // User 3 purchases tickets
      tickets.push({
        event_id: event3.id,
        user_id: userIds[2],
        title: `${event3.title} - Ticket`,
        description: `Purchased ticket for ${event3.title}`,
        status: "purchased",
        priority: "medium",
        ticket_type: "event",
        quantity: 1,
        purchase_price: event3.price,
        purchase_date: new Date().toISOString(),
        created_by: userIds[2].toString()
      });
    }

    // Create support tickets (traditional support tickets)
    tickets.push(
      {
        event_id: null,
        user_id: userIds.length > 0 ? userIds[0] : null,
        title: "Account Password Reset Request",
        description: "I forgot my password and need help resetting it. Can someone assist?",
        status: "open",
        priority: "medium",
        ticket_type: "support",
        quantity: 1,
        purchase_price: null,
        purchase_date: null,
        created_by: userIds.length > 0 ? userIds[0].toString() : adminId.toString(),
        assigned_to: adminId.toString()
      },
      {
        event_id: null,
        user_id: userIds.length > 1 ? userIds[1] : null,
        title: "Refund Request for Cancelled Event",
        description: "I purchased tickets for the cancelled comedy show. I would like a refund please.",
        status: "in_progress",
        priority: "high",
        ticket_type: "support",
        quantity: 1,
        purchase_price: null,
        purchase_date: null,
        created_by: userIds.length > 1 ? userIds[1].toString() : adminId.toString(),
        assigned_to: adminId.toString()
      },
      {
        event_id: null,
        user_id: userIds.length > 0 ? userIds[0] : null,
        title: "Technical Issue with Ticket Purchase",
        description: "I'm having trouble completing a ticket purchase. The payment page keeps timing out.",
        status: "open",
        priority: "urgent",
        ticket_type: "support",
        quantity: 1,
        purchase_price: null,
        purchase_date: null,
        created_by: userIds.length > 0 ? userIds[0].toString() : adminId.toString(),
        assigned_to: null
      },
      {
        event_id: null,
        user_id: userIds.length > 2 ? userIds[2] : null,
        title: "Question About Event Schedule",
        description: "Can someone provide more details about the timing and schedule for the Tech Conference?",
        status: "resolved",
        priority: "low",
        ticket_type: "support",
        quantity: 1,
        purchase_price: null,
        purchase_date: null,
        created_by: userIds.length > 2 ? userIds[2].toString() : adminId.toString(),
        assigned_to: adminId.toString()
      }
    );

    for (const ticket of tickets) {
      await pool.query(
        `INSERT INTO tickets (event_id, user_id, title, description, status, priority, ticket_type, quantity, purchase_price, purchase_date, created_by, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          ticket.event_id,
          ticket.user_id,
          ticket.title,
          ticket.description,
          ticket.status,
          ticket.priority,
          ticket.ticket_type,
          ticket.quantity,
          ticket.purchase_price,
          ticket.purchase_date,
          ticket.created_by,
          ticket.assigned_to
        ]
      );
    }

    console.log(`Seeded ${tickets.length} tickets successfully`);
  } catch (error) {
    console.error("Error seeding tickets:", error);
    throw error;
  }
}

export async function seedAll(): Promise<void> {
  try {
    console.log("Starting database seeding...");
    await seedDefaultAdmin();
    await seedEvents();
    await seedTickets();
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
}


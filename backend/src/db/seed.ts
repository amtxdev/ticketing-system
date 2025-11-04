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

export async function seedUsers(): Promise<void> {
  try {
    // Check if users already exist
    const existingUsers = await pool.query(
      "SELECT id FROM users WHERE role = 'user' LIMIT 1"
    );

    if (existingUsers.rows.length > 0) {
      console.log("Users already seeded");
      return;
    }

    const saltRounds = 10;
    const defaultPassword = "password123"; // Default password for all seed users
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    const users = [
      {
        email: "john.doe@example.com",
        password_hash: passwordHash,
        first_name: "John",
        last_name: "Doe",
        role: "user"
      },
      {
        email: "jane.smith@example.com",
        password_hash: passwordHash,
        first_name: "Jane",
        last_name: "Smith",
        role: "user"
      },
      {
        email: "bob.johnson@example.com",
        password_hash: passwordHash,
        first_name: "Bob",
        last_name: "Johnson",
        role: "user"
      },
      {
        email: "alice.brown@example.com",
        password_hash: passwordHash,
        first_name: "Alice",
        last_name: "Brown",
        role: "user"
      },
      {
        email: "charlie.wilson@example.com",
        password_hash: passwordHash,
        first_name: "Charlie",
        last_name: "Wilson",
        role: "user"
      }
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.email, user.password_hash, user.first_name, user.last_name, user.role]
      );
    }

    console.log(`Seeded ${users.length} users successfully`);
    console.log(`Default password for all users: ${defaultPassword}`);
  } catch (error) {
    console.error("Error seeding users:", error);
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
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
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
        available_tickets: 4800,
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
        available_tickets: 1850,
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
        available_tickets: 412,
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
        available_tickets: 878,
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
        available_tickets: 17900,
        price: 150.00,
        image_url: "https://example.com/images/basketball-finals.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Rock Concert 2024",
        description: "Epic rock concert featuring legendary bands. VIP backstage passes available.",
        venue: "Madison Square Garden, New York",
        event_date: nextMonth.toISOString(),
        total_tickets: 15000,
        available_tickets: 14950,
        price: 120.00,
        image_url: "https://example.com/images/rock-concert.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Film Festival Opening Night",
        description: "Opening night gala for the annual international film festival. Red carpet event with celebrity guests.",
        venue: "Lincoln Center, New York",
        event_date: nextWeek.toISOString(),
        total_tickets: 800,
        available_tickets: 750,
        price: 200.00,
        image_url: "https://example.com/images/film-festival.jpg",
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

    // Get regular users
    const usersResult = await pool.query(
      "SELECT id FROM users WHERE role = 'user' ORDER BY id"
    );
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length === 0) {
      console.log("No regular users found. Please seed users first.");
      return;
    }

    // Get events
    const eventsResult = await pool.query(
      "SELECT id, title, price, status FROM events ORDER BY id"
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
    const now = new Date();

    // Get specific events for purchases
    const summerFestival = eventsResult.rows.find(e => e.title.includes("Summer Music Festival"));
    const techConference = eventsResult.rows.find(e => e.title.includes("Tech Conference"));
    const jazzNight = eventsResult.rows.find(e => e.title.includes("Jazz Night"));
    const comedyShow = eventsResult.rows.find(e => e.title.includes("Comedy Show"));
    const artExhibition = eventsResult.rows.find(e => e.title.includes("Art Exhibition"));
    const basketballFinals = eventsResult.rows.find(e => e.title.includes("Basketball"));
    const rockConcert = eventsResult.rows.find(e => e.title.includes("Rock Concert"));
    const filmFestival = eventsResult.rows.find(e => e.title.includes("Film Festival"));

    // User 1 (John Doe) purchases tickets
    if (userIds.length > 0) {
      // Purchased tickets
      if (summerFestival) {
        tickets.push({
          event_id: summerFestival.id,
          user_id: userIds[0],
          title: `${summerFestival.title} - Ticket`,
          description: `Purchased ticket for ${summerFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: summerFestival.price,
          purchase_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          created_by: userIds[0].toString(),
          assigned_to: null
        });
      }

      if (techConference) {
        tickets.push({
          event_id: techConference.id,
          user_id: userIds[0],
          title: `${techConference.title} - Ticket`,
          description: `Purchased ticket for ${techConference.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: techConference.price,
          purchase_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          created_by: userIds[0].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (comedyShow) {
        tickets.push({
          event_id: comedyShow.id,
          user_id: userIds[0],
          title: `${comedyShow.title} - Cancelled Ticket`,
          description: `Cancelled ticket for ${comedyShow.title}. Requesting refund due to event cancellation.`,
          status: "cancelled",
          priority: "high",
          ticket_type: "event",
          quantity: 2,
          purchase_price: comedyShow.price,
          purchase_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          created_by: userIds[0].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: comedyShow.id,
          user_id: userIds[0],
          title: "Refund Request for Cancelled Comedy Show",
          description: `I purchased 2 tickets for the cancelled comedy show. The event was cancelled and I would like a full refund please.`,
          status: "open",
          priority: "high",
          ticket_type: "support",
          quantity: 1,
          purchase_price: null,
          purchase_date: null,
          created_by: userIds[0].toString(),
          assigned_to: adminId.toString()
        });
      }
    }

    // User 2 (Jane Smith) purchases tickets
    if (userIds.length > 1) {
      if (summerFestival) {
        tickets.push({
          event_id: summerFestival.id,
          user_id: userIds[1],
          title: `${summerFestival.title} - Ticket`,
          description: `Purchased ticket for ${summerFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 3,
          purchase_price: summerFestival.price,
          purchase_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      if (jazzNight) {
        tickets.push({
          event_id: jazzNight.id,
          user_id: userIds[1],
          title: `${jazzNight.title} - Ticket`,
          description: `Purchased ticket for ${jazzNight.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: jazzNight.price,
          purchase_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      if (basketballFinals) {
        tickets.push({
          event_id: basketballFinals.id,
          user_id: userIds[1],
          title: `${basketballFinals.title} - Ticket`,
          description: `Purchased ticket for ${basketballFinals.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 4,
          purchase_price: basketballFinals.price,
          purchase_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (artExhibition) {
        tickets.push({
          event_id: artExhibition.id,
          user_id: userIds[1],
          title: `${artExhibition.title} - Cancelled Ticket`,
          description: `Cancelled ticket for ${artExhibition.title}. Requesting refund due to schedule conflict.`,
          status: "cancelled",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: artExhibition.price,
          purchase_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          created_by: userIds[1].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: artExhibition.id,
          user_id: userIds[1],
          title: "Refund Request - Schedule Conflict",
          description: `I purchased a ticket for the Art Exhibition but have a schedule conflict. I would like to cancel and receive a refund.`,
          status: "in_progress",
          priority: "medium",
          ticket_type: "support",
          quantity: 1,
          purchase_price: null,
          purchase_date: null,
          created_by: userIds[1].toString(),
          assigned_to: adminId.toString()
        });
      }
    }

    // User 3 (Bob Johnson) purchases tickets
    if (userIds.length > 2) {
      if (techConference) {
        tickets.push({
          event_id: techConference.id,
          user_id: userIds[2],
          title: `${techConference.title} - Ticket`,
          description: `Purchased ticket for ${techConference.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: techConference.price,
          purchase_date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          created_by: userIds[2].toString(),
          assigned_to: null
        });
      }

      if (rockConcert) {
        tickets.push({
          event_id: rockConcert.id,
          user_id: userIds[2],
          title: `${rockConcert.title} - Ticket`,
          description: `Purchased ticket for ${rockConcert.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: rockConcert.price,
          purchase_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          created_by: userIds[2].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (filmFestival) {
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[2],
          title: `${filmFestival.title} - Cancelled Ticket`,
          description: `Cancelled ticket for ${filmFestival.title}. Requesting refund.`,
          status: "cancelled",
          priority: "high",
          ticket_type: "event",
          quantity: 2,
          purchase_price: filmFestival.price,
          purchase_date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
          created_by: userIds[2].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[2],
          title: "Refund Request for Film Festival Tickets",
          description: `I purchased 2 tickets for the Film Festival but can no longer attend. I would like a refund please.`,
          status: "open",
          priority: "high",
          ticket_type: "support",
          quantity: 1,
          purchase_price: null,
          purchase_date: null,
          created_by: userIds[2].toString(),
          assigned_to: adminId.toString()
        });
      }
    }

    // User 4 (Alice Brown) purchases tickets
    if (userIds.length > 3) {
      if (summerFestival) {
        tickets.push({
          event_id: summerFestival.id,
          user_id: userIds[3],
          title: `${summerFestival.title} - Ticket`,
          description: `Purchased ticket for ${summerFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: summerFestival.price,
          purchase_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          created_by: userIds[3].toString(),
          assigned_to: null
        });
      }

      if (basketballFinals) {
        tickets.push({
          event_id: basketballFinals.id,
          user_id: userIds[3],
          title: `${basketballFinals.title} - Ticket`,
          description: `Purchased ticket for ${basketballFinals.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: basketballFinals.price,
          purchase_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[3].toString(),
          assigned_to: null
        });
      }
    }

    // User 5 (Charlie Wilson) purchases tickets
    if (userIds.length > 4) {
      if (jazzNight) {
        tickets.push({
          event_id: jazzNight.id,
          user_id: userIds[4],
          title: `${jazzNight.title} - Ticket`,
          description: `Purchased ticket for ${jazzNight.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: jazzNight.price,
          purchase_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[4].toString(),
          assigned_to: null
        });
      }

      if (filmFestival) {
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[4],
          title: `${filmFestival.title} - Ticket`,
          description: `Purchased ticket for ${filmFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: filmFestival.price,
          purchase_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          created_by: userIds[4].toString(),
          assigned_to: null
        });
      }
    }

    // Insert all tickets
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

    // Update available tickets count based on purchased tickets
    const purchasedTickets = tickets.filter(t => t.status === "purchased" && t.event_id);
    const cancelledTickets = tickets.filter(t => t.status === "cancelled" && t.event_id);

    // Decrement available tickets for purchased tickets
    for (const ticket of purchasedTickets) {
      await pool.query(
        `UPDATE events 
         SET available_tickets = available_tickets - $1 
         WHERE id = $2`,
        [ticket.quantity, ticket.event_id]
      );
    }

    // Increment available tickets for cancelled tickets
    for (const ticket of cancelledTickets) {
      await pool.query(
        `UPDATE events 
         SET available_tickets = available_tickets + $1 
         WHERE id = $2`,
        [ticket.quantity, ticket.event_id]
      );
    }

    console.log(`Seeded ${tickets.length} tickets successfully`);
    console.log(`  - Purchased tickets: ${purchasedTickets.length}`);
    console.log(`  - Cancelled tickets: ${cancelledTickets.length}`);
    console.log(`  - Refund requests: ${tickets.filter(t => t.ticket_type === "support" && t.description?.includes("refund")).length}`);
  } catch (error) {
    console.error("Error seeding tickets:", error);
    throw error;
  }
}

export async function seedAll(): Promise<void> {
  try {
    console.log("Starting database seeding...");
    await seedDefaultAdmin();
    await seedUsers();
    await seedEvents();
    await seedTickets();
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
}


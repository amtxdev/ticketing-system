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
        email: "arjuna.wijaya@example.com",
        password_hash: passwordHash,
        first_name: "Arjuna",
        last_name: "Wijaya",
        role: "user"
      },
      {
        email: "sari.dewi@example.com",
        password_hash: passwordHash,
        first_name: "Sari",
        last_name: "Dewi",
        role: "user"
      },
      {
        email: "bima.satria@example.com",
        password_hash: passwordHash,
        first_name: "Bima",
        last_name: "Satria",
        role: "user"
      },
      {
        email: "indira.putri@example.com",
        password_hash: passwordHash,
        first_name: "Indira",
        last_name: "Putri",
        role: "user"
      },
      {
        email: "rajendra.kurniawan@example.com",
        password_hash: passwordHash,
        first_name: "Rajendra",
        last_name: "Kurniawan",
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

    // Set dates to 2025
    const baseDate = new Date('2025-12-30');
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(baseDate);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(baseDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const lastMonth = new Date(baseDate);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastWeek = new Date(baseDate);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const events = [
      {
        title: "Java Jazz Festival 2025",
        description: "Festival musik jazz terbesar di Asia Tenggara menampilkan artis jazz internasional dan lokal terbaik. Nikmati suasana musik jazz yang hangat dengan makanan dan minuman khas Indonesia.",
        venue: "Jakarta Convention Center, Jakarta",
        event_date: nextWeek.toISOString(),
        total_tickets: 5000,
        available_tickets: 4800,
        price: 750000,
        image_url: "https://exhibition.jiexpo.com/wp-content/uploads/sites/5/2023/06/055480900_1675155568-JJF_Dates_1080x1080.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Indonesia Tech Summit 2025",
        description: "Konferensi teknologi tahunan yang membahas AI, komputasi awan, keamanan siber, dan pengembangan perangkat lunak. Termasuk sesi networking dan workshop.",
        venue: "Balai Sidang Jakarta, Jakarta",
        event_date: tomorrow.toISOString(),
        total_tickets: 2000,
        available_tickets: 1850,
        price: 2500000,
        image_url: "https://cf-images.eu-west-1.prod.boltdns.net/v1/static/1813624294001/926b0bc9-e7b4-4156-978f-4e156f71dd47/d10c2e97-a914-4f7b-a859-cdf8b46d8ffd/1280x720/match/image.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Konser Dangdut Megaraya",
        description: "Konser dangdut spektakuler menampilkan bintang dangdut terpopuler Indonesia. Dijamin meriah dengan tarian dan musik yang menghentak.",
        venue: "Istora Senayan, Jakarta",
        event_date: baseDate.toISOString(),
        total_tickets: 15000,
        available_tickets: 4500,
        price: 500000,
        image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtygJWREdeBn-zH9txqLhOBnqIek8YZ4K95g&s",
        status: "live",
        created_by: adminId
      },
      {
        title: "Jakarta Marathon 2025",
        description: "Marathon tahunan Jakarta dengan pilihan 10K, half-marathon, dan full marathon. Diskon pendaftaran early bird tersedia.",
        venue: "Monas, Jakarta",
        event_date: lastMonth.toISOString(),
        total_tickets: 10000,
        available_tickets: 0,
        price: 350000,
        image_url: "https://koma.id/wp-content/uploads/2025/06/Banner-Jakim-Website.png",
        status: "completed",
        created_by: adminId
      },
      {
        title: "Stand Up Comedy Show - Dibatalkan",
        description: "Malam stand up comedy dengan komedian terkenal. Acara ini dibatalkan karena keadaan yang tidak terduga.",
        venue: "Teater Jakarta, Jakarta",
        event_date: lastWeek.toISOString(),
        total_tickets: 300,
        available_tickets: 300,
        price: 200000,
        image_url: "image.png",
        status: "cancelled",
        created_by: adminId
      },
      {
        title: "Pameran Seni Rupa Modern Indonesia",
        description: "Pameran menampilkan karya seniman kontemporer Indonesia. Tur pemandu tersedia. Kapasitas terbatas.",
        venue: "Galeri Nasional Indonesia, Jakarta",
        event_date: nextWeek.toISOString(),
        total_tickets: 500,
        available_tickets: 412,
        price: 150000,
        image_url: "https://www.impessa.id/sas-content/uploads/modules/posts/20220811093814.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Festival Kuliner Nusantara",
        description: "Rayakan keunggulan kuliner Indonesia dengan berbagai hidangan dari seluruh nusantara, wine pairing, dan demonstrasi memasak.",
        venue: "Ancol, Jakarta",
        event_date: nextWeek.toISOString(),
        total_tickets: 2000,
        available_tickets: 1878,
        price: 300000,
        image_url: "https://api-internal.jakcation.id/jakcation-be/storage/banners/QqTJWCMkKtq8rjaCsOTp64vmh7LvDQfTh7uAvuW3.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Final Liga Basket Indonesia 2025",
        description: "Saksikan final liga basket Indonesia secara langsung di arena. Paket VIP dengan meet-and-greet tersedia.",
        venue: "Istora Senayan, Jakarta",
        event_date: tomorrow.toISOString(),
        total_tickets: 8000,
        available_tickets: 7900,
        price: 400000,
        image_url: "https://media.indozone.id/crop/0x0:0x0/images/2025/07/16/1qd3KBDRFp1f0GrQsENYAZxCxwp01CfFCN56QXJR.jpg",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Konser Rock Indonesia 2025",
        description: "Konser rock epik menampilkan band legendaris Indonesia. Tiket backstage VIP tersedia.",
        venue: "Gelora Bung Karno, Jakarta",
        event_date: nextMonth.toISOString(),
        total_tickets: 15000,
        available_tickets: 14950,
        price: 600000,
        image_url: "https://awsimages.detik.net.id/community/media/visual/2023/06/02/poster-konser-one-ok-rock-di-jakarta.jpeg?w=650",
        status: "upcoming",
        created_by: adminId
      },
      {
        title: "Festival Film Indonesia - Malam Pembukaan",
        description: "Malam gala pembukaan festival film internasional tahunan. Acara red carpet dengan tamu selebriti.",
        venue: "Taman Ismail Marzuki, Jakarta",
        event_date: nextWeek.toISOString(),
        total_tickets: 800,
        available_tickets: 750,
        price: 800000,
        image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYT-k3_knqPUO0QZtOHIM0dSZ0T-Zc_2Q2sQ&s",
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
    const baseDate2025 = new Date('2025-01-15');

    // Get specific events for purchases
    const javaJazzFestival = eventsResult.rows.find(e => e.title.includes("Java Jazz Festival"));
    const techSummit = eventsResult.rows.find(e => e.title.includes("Tech Summit"));
    const dangdutConcert = eventsResult.rows.find(e => e.title.includes("Dangdut"));
    const comedyShow = eventsResult.rows.find(e => e.title.includes("Comedy"));
    const artExhibition = eventsResult.rows.find(e => e.title.includes("Seni Rupa"));
    const basketballFinals = eventsResult.rows.find(e => e.title.includes("Basket"));
    const rockConcert = eventsResult.rows.find(e => e.title.includes("Rock Indonesia"));
    const filmFestival = eventsResult.rows.find(e => e.title.includes("Film Indonesia"));

    // User 1 (Arjuna Wijaya) purchases tickets
    if (userIds.length > 0) {
      // Purchased tickets
      if (javaJazzFestival) {
        tickets.push({
          event_id: javaJazzFestival.id,
          user_id: userIds[0],
          title: `${javaJazzFestival.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${javaJazzFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: javaJazzFestival.price,
          purchase_date: new Date(baseDate2025.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          created_by: userIds[0].toString(),
          assigned_to: null
        });
      }

      if (techSummit) {
        tickets.push({
          event_id: techSummit.id,
          user_id: userIds[0],
          title: `${techSummit.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${techSummit.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: techSummit.price,
          purchase_date: new Date(baseDate2025.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          created_by: userIds[0].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (comedyShow) {
        tickets.push({
          event_id: comedyShow.id,
          user_id: userIds[0],
          title: `${comedyShow.title} - Tiket Dibatalkan`,
          description: `Tiket yang dibatalkan untuk ${comedyShow.title}. Meminta pengembalian dana karena acara dibatalkan.`,
          status: "cancelled",
          priority: "high",
          ticket_type: "event",
          quantity: 2,
          purchase_price: comedyShow.price,
          purchase_date: new Date(baseDate2025.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          created_by: userIds[0].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: comedyShow.id,
          user_id: userIds[0],
          title: "Permintaan Pengembalian Dana untuk Stand Up Comedy Show",
          description: `Saya membeli 2 tiket untuk acara stand up comedy yang dibatalkan. Acara dibatalkan dan saya ingin pengembalian dana penuh.`,
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

    // User 2 (Sari Dewi) purchases tickets
    if (userIds.length > 1) {
      if (javaJazzFestival) {
        tickets.push({
          event_id: javaJazzFestival.id,
          user_id: userIds[1],
          title: `${javaJazzFestival.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${javaJazzFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 3,
          purchase_price: javaJazzFestival.price,
          purchase_date: new Date(baseDate2025.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      if (dangdutConcert) {
        tickets.push({
          event_id: dangdutConcert.id,
          user_id: userIds[1],
          title: `${dangdutConcert.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${dangdutConcert.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: dangdutConcert.price,
          purchase_date: new Date(baseDate2025.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      if (basketballFinals) {
        tickets.push({
          event_id: basketballFinals.id,
          user_id: userIds[1],
          title: `${basketballFinals.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${basketballFinals.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 4,
          purchase_price: basketballFinals.price,
          purchase_date: new Date(baseDate2025.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[1].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (artExhibition) {
        tickets.push({
          event_id: artExhibition.id,
          user_id: userIds[1],
          title: `${artExhibition.title} - Tiket Dibatalkan`,
          description: `Tiket yang dibatalkan untuk ${artExhibition.title}. Meminta pengembalian dana karena konflik jadwal.`,
          status: "cancelled",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: artExhibition.price,
          purchase_date: new Date(baseDate2025.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          created_by: userIds[1].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: artExhibition.id,
          user_id: userIds[1],
          title: "Permintaan Pengembalian Dana - Konflik Jadwal",
          description: `Saya membeli tiket untuk Pameran Seni Rupa tetapi ada konflik jadwal. Saya ingin membatalkan dan menerima pengembalian dana.`,
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

    // User 3 (Bima Satria) purchases tickets
    if (userIds.length > 2) {
      if (techSummit) {
        tickets.push({
          event_id: techSummit.id,
          user_id: userIds[2],
          title: `${techSummit.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${techSummit.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: techSummit.price,
          purchase_date: new Date(baseDate2025.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          created_by: userIds[2].toString(),
          assigned_to: null
        });
      }

      if (rockConcert) {
        tickets.push({
          event_id: rockConcert.id,
          user_id: userIds[2],
          title: `${rockConcert.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${rockConcert.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: rockConcert.price,
          purchase_date: new Date(baseDate2025.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          created_by: userIds[2].toString(),
          assigned_to: null
        });
      }

      // Cancelled ticket with refund request
      if (filmFestival) {
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[2],
          title: `${filmFestival.title} - Tiket Dibatalkan`,
          description: `Tiket yang dibatalkan untuk ${filmFestival.title}. Meminta pengembalian dana.`,
          status: "cancelled",
          priority: "high",
          ticket_type: "event",
          quantity: 2,
          purchase_price: filmFestival.price,
          purchase_date: new Date(baseDate2025.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
          created_by: userIds[2].toString(),
          assigned_to: adminId.toString()
        });

        // Refund request support ticket
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[2],
          title: "Permintaan Pengembalian Dana untuk Tiket Festival Film",
          description: `Saya membeli 2 tiket untuk Festival Film Indonesia tetapi tidak bisa hadir lagi. Saya ingin pengembalian dana.`,
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

    // User 4 (Indira Putri) purchases tickets
    if (userIds.length > 3) {
      if (javaJazzFestival) {
        tickets.push({
          event_id: javaJazzFestival.id,
          user_id: userIds[3],
          title: `${javaJazzFestival.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${javaJazzFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: javaJazzFestival.price,
          purchase_date: new Date(baseDate2025.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          created_by: userIds[3].toString(),
          assigned_to: null
        });
      }

      if (basketballFinals) {
        tickets.push({
          event_id: basketballFinals.id,
          user_id: userIds[3],
          title: `${basketballFinals.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${basketballFinals.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 2,
          purchase_price: basketballFinals.price,
          purchase_date: new Date(baseDate2025.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[3].toString(),
          assigned_to: null
        });
      }
    }

    // User 5 (Rajendra Kurniawan) purchases tickets
    if (userIds.length > 4) {
      if (dangdutConcert) {
        tickets.push({
          event_id: dangdutConcert.id,
          user_id: userIds[4],
          title: `${dangdutConcert.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${dangdutConcert.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: dangdutConcert.price,
          purchase_date: new Date(baseDate2025.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          created_by: userIds[4].toString(),
          assigned_to: null
        });
      }

      if (filmFestival) {
        tickets.push({
          event_id: filmFestival.id,
          user_id: userIds[4],
          title: `${filmFestival.title} - Tiket`,
          description: `Tiket yang dibeli untuk ${filmFestival.title}`,
          status: "purchased",
          priority: "medium",
          ticket_type: "event",
          quantity: 1,
          purchase_price: filmFestival.price,
          purchase_date: new Date(baseDate2025.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
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


import bcrypt from "bcryptjs";
import { pool } from "./connection";

export async function seedDefaultAdmin(): Promise<void> {
  try {

    const adminEmail = `${process.env.ADMIN_EMAIL}`;
    const adminPassword = `${process.env.ADMIN_PASSWORD}`;
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Default admin user already exists");
      return;
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


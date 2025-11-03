import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if users table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `

    const tableExists = await executeQuery(checkTableQuery)

    if (!tableExists || !tableExists[0] || !tableExists[0].exists) {
      // Create users table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user'
        );
      `

      await executeQuery(createTableQuery)

      // Insert a default admin user
      const insertUserQuery = `
        INSERT INTO users (email, password, name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING;
      `

      await executeQuery(insertUserQuery, [
        "admin@viaggidelqatar.com",
        "admin123", // You should use a hashed password in production
        "Admin User",
        "admin",
      ])

      return NextResponse.json({
        success: true,
        message: "Users table created and default admin user added",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Users table already exists",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error setting up database",
      },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Create packages table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        cruise_line VARCHAR(50) NOT NULL,
        excursions_count INTEGER NOT NULL,
        adult_price DECIMAL(10,2) NOT NULL,
        child_price DECIMAL(10,2) NOT NULL,
        is_popular BOOLEAN DEFAULT FALSE,
        color_scheme VARCHAR(50) DEFAULT 'blue',
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], { useCache: false, retries: 2, useMockOnFailure: true })

    // Check if packages already exist
    const existingPackages = await executeQuery(
      "SELECT COUNT(*) as count FROM packages",
      [],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    if (existingPackages && existingPackages[0]?.count > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Packages table already exists with data" 
      })
    }

    // Insert default packages
    const defaultPackages = [
      {
        name: "Pacchetto 3 Escursioni - COSTA",
        description: "Doha e Muscat + 1 escursione a scelta",
        cruise_line: "COSTA",
        excursions_count: 3,
        adult_price: 150.00,
        child_price: 90.00,
        is_popular: false,
        color_scheme: "blue",
        sort_order: 1
      },
      {
        name: "Pacchetto 4 Escursioni - COSTA",
        description: "Doha e Muscat + 2 escursioni a scelta",
        cruise_line: "COSTA",
        excursions_count: 4,
        adult_price: 220.00,
        child_price: 120.00,
        is_popular: true,
        color_scheme: "blue",
        sort_order: 2
      },
      {
        name: "Pacchetto 3 Escursioni - MSC",
        description: "Doha e Manama + 1 escursione a scelta",
        cruise_line: "MSC",
        excursions_count: 3,
        adult_price: 165.00,
        child_price: 90.00,
        is_popular: false,
        color_scheme: "purple",
        sort_order: 3
      },
      {
        name: "Pacchetto 4 Escursioni - MSC",
        description: "Doha e Manama + 2 escursioni a scelta",
        cruise_line: "MSC",
        excursions_count: 4,
        adult_price: 235.00,
        child_price: 125.00,
        is_popular: true,
        color_scheme: "purple",
        sort_order: 4
      }
    ]

    for (const pkg of defaultPackages) {
      await executeQuery(
        `INSERT INTO packages (name, description, cruise_line, excursions_count, adult_price, child_price, is_popular, color_scheme, sort_order) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [pkg.name, pkg.description, pkg.cruise_line, pkg.excursions_count, pkg.adult_price, pkg.child_price, pkg.is_popular, pkg.color_scheme, pkg.sort_order],
        { useCache: false, retries: 2, useMockOnFailure: true }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Packages table created and initialized with default data" 
    })

  } catch (error) {
    console.error("Error initializing packages:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize packages" },
      { status: 500 }
    )
  }
} 
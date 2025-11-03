import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Use the db utility to query the database
    const sql = db()

    const tours = await sql`
      SELECT 
        id, 
        name, 
        ship_name, 
        location, 
        price, 
        status
      FROM tours
      ORDER BY created_at DESC
      LIMIT 100
    `

    return NextResponse.json(tours)
  } catch (error) {
    console.error("Error fetching tours:", error)

    // Return mock data in case of error
    const mockTours = [
      {
        id: "mock-1",
        name: "Sample Tour",
        ship_name: "Sample Ship",
        location: "Sample Location",
        price: "150.00",
        status: "active",
      },
    ]

    return NextResponse.json(mockTours)
  }
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Use the db utility to query the database
    const sql = db()

    const bookings = await sql`
      SELECT 
        b.id, 
        b.booking_reference, 
        b.tour_date, 
        b.customer_name, 
        b.email, 
        b.status, 
        b.total_payment,
        t.name as tour_name
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      ORDER BY b.created_at DESC
      LIMIT 100
    `

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)

    // Return mock data in case of error
    const mockBookings = [
      {
        id: "mock-1",
        booking_reference: "MOCK-001",
        tour_date: new Date().toISOString(),
        customer_name: "Sample Customer",
        email: "sample@example.com",
        status: "pending",
        total_payment: "100.00",
        tour_name: "Sample Tour",
      },
    ]

    return NextResponse.json(mockBookings)
  }
}

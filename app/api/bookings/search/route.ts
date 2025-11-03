import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ bookings: [] })
    }

    const searchTerm = `%${query.trim()}%`

    // Search across multiple fields
    const bookings = await sql`
      SELECT 
        b.id,
        b.booking_reference,
        b.tour_date,
        b.status,
        b.tour_guide,
        b.marketing_source,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        s.name as ship_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN ships s ON t.ship_id = s.id
      WHERE 
        b.booking_reference ILIKE ${searchTerm}
        OR c.name ILIKE ${searchTerm}
        OR c.email ILIKE ${searchTerm}
        OR c.phone ILIKE ${searchTerm}
        OR t.name ILIKE ${searchTerm}
        OR b.tour_guide ILIKE ${searchTerm}
        OR b.marketing_source ILIKE ${searchTerm}
      ORDER BY b.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      bookings: bookings || [],
      count: bookings?.length || 0,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
        bookings: [],
      },
      { status: 500 },
    )
  }
}

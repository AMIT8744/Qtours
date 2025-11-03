import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const reference = params.reference
    console.log("Debug API called for reference:", reference)

    // Check all bookings to see what exists
    const allBookings = await executeQuery(
      "SELECT booking_reference, status, customer_id, tour_id FROM bookings LIMIT 10",
      [],
      { useCache: false },
    )

    // Check exact match
    const exactMatch = await executeQuery("SELECT * FROM bookings WHERE booking_reference = $1", [reference], {
      useCache: false,
    })

    // Check case insensitive match
    const caseInsensitiveMatch = await executeQuery(
      "SELECT * FROM bookings WHERE UPPER(booking_reference) = UPPER($1)",
      [reference],
      { useCache: false },
    )

    // Check with LIKE pattern
    const likeMatch = await executeQuery("SELECT * FROM bookings WHERE booking_reference LIKE $1", [`%${reference}%`], {
      useCache: false,
    })

    // Check tours table structure
    const tourColumns = await executeQuery(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'tours' AND table_schema = 'public'`,
      [],
      { useCache: false },
    )

    return NextResponse.json({
      searchReference: reference,
      allBookings: allBookings,
      exactMatch: exactMatch,
      caseInsensitiveMatch: caseInsensitiveMatch,
      likeMatch: likeMatch,
      tourColumns: tourColumns,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Debug API failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

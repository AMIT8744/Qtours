import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const customerEmail = searchParams.get("email")

    if (!paymentId || !customerEmail) {
      return NextResponse.json({ error: "Missing payment ID or email" }, { status: 400 })
    }

    // Check if booking exists with this payment reference
    const booking = await executeQuery(
      `
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        c.name as customer_name,
        c.email,
        t.name as tour_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id  
      LEFT JOIN tours t ON b.tour_id = t.id
      WHERE (b.other LIKE $1 OR b.notes LIKE $1) AND c.email = $2
      ORDER BY b.created_at DESC
      LIMIT 1
      `,
      [`%${paymentId}%`, customerEmail],
      { useCache: false },
    )

    if (booking.length > 0) {
      return NextResponse.json({
        success: true,
        booking: booking[0],
        message: "Booking found and confirmed",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Booking not found. It may still be processing.",
      })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

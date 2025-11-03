import { NextResponse } from "next/server"
import { safeExecuteQuery } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`Fetching tours for booking ID: ${bookingId}`)

    // First check if there are any tours in the booking_tours table
    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.tour_id,
        t.name as tour_name,
        s.name as ship_name,
        l.name as location,
        bt.tour_date,
        bt.adults,
        bt.children,
        bt.total_pax,
        bt.price
      FROM 
        booking_tours bt
      LEFT JOIN 
        tours t ON bt.tour_id = t.id
      LEFT JOIN 
        ships s ON t.ship_id = s.id
      LEFT JOIN 
        locations l ON t.location_id = l.id
      WHERE
        bt.booking_id = $1
      ORDER BY
        bt.tour_date ASC
      `,
      [bookingId],
      { useCache: false },
    )

    // If there are no tours in booking_tours, get the main tour from the booking
    if (!tours || tours.length === 0) {
      console.log(`No tours found in booking_tours, checking main booking record`)

      const mainTour = await safeExecuteQuery(
        `
        SELECT 
          b.id,
          b.tour_id,
          t.name as tour_name,
          s.name as ship_name,
          l.name as location,
          b.tour_date,
          b.adults,
          b.children,
          b.total_pax,
          b.total_payment as price
        FROM 
          bookings b
        LEFT JOIN 
          tours t ON b.tour_id = t.id
        LEFT JOIN 
          ships s ON t.ship_id = s.id
        LEFT JOIN 
          locations l ON t.location_id = l.id
        WHERE
          b.id = $1
        `,
        [bookingId],
        { useCache: false },
      )

      if (mainTour && mainTour.length > 0) {
        console.log(`Found main tour in booking: ${mainTour[0].tour_name}`)
        return NextResponse.json({ tours: mainTour })
      }

      console.log(`No tours found for booking ${bookingId}`)
      return NextResponse.json({ tours: [] })
    }

    console.log(`Found ${tours.length} tours for booking ${bookingId}`)
    return NextResponse.json({ tours })
  } catch (error) {
    console.error("Error fetching booking tours:", error)
    return NextResponse.json({ error: "Failed to fetch booking tours" }, { status: 500 })
  }
}

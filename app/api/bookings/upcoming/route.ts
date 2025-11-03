import { type NextRequest, NextResponse } from "next/server"
import { safeExecuteQuery } from "@/lib/db"
import { formatDateToYYYYMMDD } from "@/lib/date-utils"
import { getAgentNameById } from "@/app/actions/agent-display-actions"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get("days") || "7"
    const daysAhead = Number.parseInt(days, 10)

    if (isNaN(daysAhead) || daysAhead < 0 || daysAhead > 90) {
      return NextResponse.json({ error: "Invalid days parameter. Must be between 0 and 90." }, { status: 400 })
    }

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    const todayFormatted = formatDateToYYYYMMDD(today)
    const futureDateFormatted = formatDateToYYYYMMDD(futureDate)

    // For "today" (days=0), we only want today's bookings
    const startDate = daysAhead === 0 ? todayFormatted : todayFormatted
    const endDate = daysAhead === 0 ? todayFormatted : futureDateFormatted

    console.log(`Fetching bookings from ${startDate} to ${endDate}`)

    // Get bookings with enhanced agent data
    const bookings = await safeExecuteQuery(
      `
      SELECT DISTINCT
        b.id, 
        b.booking_reference, 
        b.tour_date, 
        t.name as tour_name, 
        COALESCE(ships.name, 'MSC') as ship_name,
        c.name as customer_name,
        b.adults,
        b.children,
        b.total_pax,
        b.deposit,
        b.remaining_balance,
        b.total_payment,
        l.name as location,
        c.email,
        b.commission,
        c.phone,
        b.status,
        b.payment_location,
        b.marketing_source,
        COALESCE(b.total_net, 0) as total_net,
        -- Get the first booking agent from booking_tours
        (
          SELECT ba.name 
          FROM booking_tours bt 
          LEFT JOIN booking_agents ba ON ba.id = bt.booking_agent_id 
          WHERE bt.booking_id = b.id 
          AND ba.name IS NOT NULL
          LIMIT 1
        ) as tour_guide
      FROM 
        bookings b
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        locations l ON t.location_id = l.id
      WHERE 
        b.tour_date >= $1 AND b.tour_date <= $2
      ORDER BY 
        b.tour_date ASC
      LIMIT 100
      `,
      [startDate, endDate],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (!bookings || bookings.length === 0) {
      console.log("No upcoming bookings found")
      return NextResponse.json({
        bookings: [],
        tours: [],
      })
    }

    console.log(`Found ${bookings.length} bookings, processing agent names...`)

    // Process bookings to ensure numeric fields are properly formatted and enhance agent names
    const processedBookings = await Promise.all(
      bookings.map(async (booking) => {
        let tourGuide = booking.tour_guide || "No Guide"

        // If no tour guide found in the subquery, try the helper function
        if (!tourGuide || tourGuide === "No Guide") {
          try {
            const bookingTours = await safeExecuteQuery(
              `
              SELECT bt.booking_agent_id
              FROM booking_tours bt
              WHERE bt.booking_id = $1
              AND bt.booking_agent_id IS NOT NULL
              LIMIT 1
              `,
              [booking.id],
              { useCache: false, timeout: 5000, retries: 1 },
            )

            if (bookingTours && bookingTours.length > 0 && bookingTours[0].booking_agent_id) {
              tourGuide = await getAgentNameById(bookingTours[0].booking_agent_id)
            }
          } catch (error) {
            console.error(`Error fetching agent for booking ${booking.id}:`, error)
          }
        }

        return {
          ...booking,
          adults: Number(booking.adults) || 0,
          children: Number(booking.children) || 0,
          total_pax: Number(booking.total_pax) || 0,
          deposit: Number(booking.deposit) || 0,
          remaining_balance: Number(booking.remaining_balance) || 0,
          total_payment: Number(booking.total_payment) || 0,
          commission: Number(booking.commission) || 0,
          total_net: Number(booking.total_net) || Number(booking.total_payment) - Number(booking.commission) || 0,
          tour_guide: tourGuide, // Set the proper tour guide name
        }
      }),
    )

    // Transform the data to match the expected format for the Upcoming Tours component
    const tours = processedBookings.map((booking) => ({
      id: booking.id,
      name: booking.tour_name,
      tour_name: booking.tour_name,
      start_date: booking.tour_date,
      tour_date: booking.tour_date,
      end_date: booking.tour_date, // Same as start date for single day tours
      total_pax: booking.total_pax,
      adults: booking.adults,
      children: booking.children,
      ship_name: booking.ship_name,
      location: booking.location,
      customer_name: booking.customer_name,
      booking_reference: booking.booking_reference,
      status: booking.status,
      tour_guide: booking.tour_guide, // Include the tour guide in tours data
      marketing_source: booking.marketing_source,
      payment_location: booking.payment_location,
      image_url: "/placeholder.svg?height=128&width=256&query=tour+image",
    }))

    console.log("Processed bookings sample:", processedBookings.slice(0, 2))
    console.log("Tours sample:", tours.slice(0, 2))

    return NextResponse.json({
      bookings: processedBookings,
      tours: tours,
    })
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch upcoming bookings",
        bookings: [],
        tours: [],
      },
      { status: 500 },
    )
  }
}

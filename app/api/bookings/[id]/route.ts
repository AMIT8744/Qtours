import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, safeExecuteQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getAgentNameById } from "@/app/actions/agent-display-actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate that id is a valid integer
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 })
    }

    console.log(`API: Fetching booking details for ID ${id} with agent data...`)

    // Get booking details
    const bookings = await safeExecuteQuery(
      `
      SELECT 
        b.id, 
        b.booking_reference, 
        b.created_at,
        b.tour_date,
        c.name as customer_name,
        c.email,
        c.phone,
        a.name as agent_name,
        b.status,
        b.deposit,
        b.remaining_balance,
        b.total_payment,
        b.commission,
        b.adults,
        b.children,
        b.total_pax,
        b.notes,
        t.name as tour_name,
        s.name as ship_name,
        l.name as location,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        agents a ON b.agent_id = a.id
      LEFT JOIN
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships s ON t.ship_id = s.id
      LEFT JOIN
        locations l ON t.location_id = l.id
      WHERE
        b.id = $1
      `,
      [id],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (bookings.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Get tours associated with this booking with enhanced agent data
    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.tour_id,
        bt.booking_agent_id,
        t.name as tour_name,
        s.name as ship_name,
        l.name as location,
        bt.tour_date,
        bt.adults,
        bt.children,
        bt.total_pax,
        bt.price,
        bt.notes,
        bt.tour_guide,
        ba.name as agent_name
      FROM 
        booking_tours bt
      LEFT JOIN 
        tours t ON bt.tour_id = t.id
      LEFT JOIN 
        ships s ON t.ship_id = s.id
      LEFT JOIN
        locations l ON t.location_id = l.id
      LEFT JOIN
        booking_agents ba ON ba.id = bt.booking_agent_id
      WHERE
        bt.booking_id = $1
      ORDER BY
        bt.tour_date ASC
      `,
      [id],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    // Enhance tours with proper agent names
    const enhancedTours = await Promise.all(
      tours.map(async (tour) => {
        let agentName = "No Guide"

        if (tour.agent_name) {
          // Direct agent name from JOIN
          agentName = tour.agent_name
        } else if (tour.booking_agent_id) {
          // Fallback: use helper function
          try {
            agentName = await getAgentNameById(tour.booking_agent_id)
          } catch (error) {
            console.error(`Error getting agent name for ID ${tour.booking_agent_id}:`, error)
            agentName = "Unknown Agent"
          }
        }

        // Calculate total_net for each tour if not already available
        const commission = bookings[0].commission || 0
        const price = Number(tour.price) || 0
        const tourCommission = price * (commission / Number(bookings[0].total_payment || 1))
        const total_net = price - tourCommission

        return {
          ...tour,
          tour_guide: agentName, // Override with actual agent name
          agent_name: agentName, // Also set agent_name for consistency
          total_net,
        }
      }),
    )

    console.log(`API: Enhanced ${enhancedTours.length} tours with agent names for booking ${id}`)

    // Return booking with enhanced tours
    return NextResponse.json({
      booking: bookings[0],
      tours: enhancedTours,
    })
  } catch (error) {
    console.error("API: Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate that id is a valid integer
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 })
    }

    // Delete the booking
    await executeQuery("DELETE FROM bookings WHERE id = $1", [id], { useCache: false })

    // Revalidate paths
    revalidatePath("/dashboard/bookings")
    revalidatePath("/dashboard")

    return NextResponse.json({ success: true, message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}

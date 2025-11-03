"use server"

import { executeQuery, safeExecuteQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getAgentNameById } from "./agent-display-actions"

// Enhanced fetchBookings function with proper agent name resolution
export async function fetchBookings() {
  try {
    console.log("Fetching bookings with enhanced agent data...")

    const bookings = await safeExecuteQuery(
      `
      SELECT 
        b.id, 
        b.booking_reference, 
        b.tour_date, 
        b.status, 
        b.deposit, 
        b.remaining_balance,
        b.total_payment,
        b.created_at,
        b.adults,
        b.children,
        b.total_pax,
        b.commission,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net,
        b.notes,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        t.ship_id,
        ships.name as ship_name,
        (
          SELECT COUNT(*) 
          FROM booking_tours bt 
          WHERE bt.booking_id = b.id
        ) as tour_count,
        (
          SELECT s.name 
          FROM booking_tours bt2 
          LEFT JOIN tours t2 ON bt2.tour_id = t2.id 
          LEFT JOIN ships s ON t2.ship_id = s.id 
          WHERE bt2.booking_id = b.id 
          LIMIT 1
        ) as primary_ship_name
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      ORDER BY 
        b.created_at DESC
      `,
      [],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (!bookings || bookings.length === 0) {
      console.log("No bookings found")
      return []
    }

    console.log(`Found ${bookings.length} bookings, now fetching agent names...`)

    // For each booking, get the primary booking agent from booking_tours
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Get the first booking agent from booking_tours for this booking
          const bookingTours = await safeExecuteQuery(
            `
            SELECT 
              bt.booking_agent_id,
              bt.ship_id,
              ba.name as agent_name,
              s.name as ship_name
            FROM booking_tours bt
            LEFT JOIN booking_agents ba ON ba.id = bt.booking_agent_id
            LEFT JOIN ships s ON s.id = bt.ship_id
            WHERE bt.booking_id = $1
            ORDER BY bt.created_at ASC
            LIMIT 1
            `,
            [booking.id],
            { useCache: false, timeout: 5000, retries: 1 },
          )

          let agentName = "No Guide"
          let shipName = booking.ship_name || booking.primary_ship_name || "Unknown Ship"

          if (bookingTours && bookingTours.length > 0) {
            if (bookingTours[0].agent_name) {
              agentName = bookingTours[0].agent_name
            } else if (bookingTours[0].booking_agent_id) {
              agentName = await getAgentNameById(bookingTours[0].booking_agent_id)
            }

            // Use ship name from booking_tours if available
            if (bookingTours[0].ship_name) {
              shipName = bookingTours[0].ship_name
            }
          }

          return {
            ...booking,
            tour_guide: agentName,
            agent_name: agentName,
            ship_name: shipName,
          }
        } catch (error) {
          console.error(`Error fetching agent for booking ${booking.id}:`, error)
          return {
            ...booking,
            tour_guide: "No Guide",
            agent_name: "No Guide",
            ship_name: booking.ship_name || booking.primary_ship_name || "Unknown Ship",
          }
        }
      }),
    )

    console.log("Enhanced bookings with agent names:", enhancedBookings.slice(0, 3)) // Log first 3 for debugging
    return enhancedBookings
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

// Enhanced fetchBookingTours function with proper agent name resolution
export async function fetchBookingTours(bookingId: string) {
  try {
    console.log(`Fetching tours for booking ${bookingId} with agent data...`)

    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.tour_id,
        bt.booking_agent_id,
        bt.ship_id,
        t.name as tour_name,
        t.ship_id as tour_ship_id,
        COALESCE(bt_ships.name, t_ships.name) as ship_name,
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
        ships bt_ships ON bt_ships.id = bt.ship_id
      LEFT JOIN
        ships t_ships ON t_ships.id = t.ship_id
      LEFT JOIN
        locations l ON t.location_id = l.id
      LEFT JOIN
        booking_agents ba ON ba.id = bt.booking_agent_id
      WHERE
        bt.booking_id = $1
      ORDER BY
        bt.tour_date ASC
      `,
      [bookingId],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (!tours || tours.length === 0) {
      console.log(`No tours found for booking ${bookingId}`)
      return []
    }

    // Enhance tours with proper agent names
    const enhancedTours = await Promise.all(
      tours.map(async (tour) => {
        let agentName = "No Guide"

        if (tour.agent_name) {
          // Direct agent name from JOIN
          agentName = tour.agent_name
        } else if (tour.booking_agent_id) {
          // Fallback: use helper function
          agentName = await getAgentNameById(tour.booking_agent_id)
        }

        return {
          ...tour,
          tour_guide: agentName, // Override tour_guide with actual agent name
          agent_name: agentName, // Also set agent_name for consistency
          ship_name: tour.ship_name || "Unknown Ship", // Ensure ship_name is set
        }
      }),
    )

    console.log(`Enhanced ${enhancedTours.length} tours with agent names for booking ${bookingId}`)
    return enhancedTours
  } catch (error) {
    console.error(`Error fetching tours for booking ${bookingId}:`, error)
    return []
  }
}

// Enhanced fetchRecentBookings function
export async function fetchRecentBookings(limit = 10) {
  try {
    console.log(`Fetching ${limit} recent bookings with agent data...`)

    const bookings = await safeExecuteQuery(
      `
      SELECT 
        b.id, 
        b.booking_reference, 
        b.tour_date, 
        b.status, 
        b.deposit, 
        b.remaining_balance,
        b.total_payment,
        b.created_at,
        b.adults,
        b.children,
        b.total_pax,
        b.commission,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        ships.name as ship_name,
        (
          SELECT COUNT(*) 
          FROM booking_tours bt 
          WHERE bt.booking_id = b.id
        ) as tour_count,
        (
          SELECT s.name 
          FROM booking_tours bt2 
          LEFT JOIN ships s ON s.id = bt2.ship_id 
          WHERE bt2.booking_id = b.id 
          AND s.name IS NOT NULL
          LIMIT 1
        ) as primary_ship_name
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      ORDER BY 
        b.created_at DESC
      LIMIT $1
      `,
      [limit],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (!bookings || bookings.length === 0) {
      return []
    }

    // Enhance with agent names
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Get the primary booking agent from booking_tours
          const bookingTours = await safeExecuteQuery(
            `
            SELECT 
              bt.booking_agent_id,
              bt.ship_id,
              ba.name as agent_name,
              s.name as ship_name
            FROM booking_tours bt
            LEFT JOIN booking_agents ba ON ba.id = bt.booking_agent_id
            LEFT JOIN ships s ON s.id = bt.ship_id
            WHERE bt.booking_id = $1
            ORDER BY bt.created_at ASC
            LIMIT 1
            `,
            [booking.id],
            { useCache: false, timeout: 5000, retries: 1 },
          )

          let agentName = "No Guide"
          let shipName = booking.ship_name || booking.primary_ship_name || "Unknown Ship"

          if (bookingTours && bookingTours.length > 0) {
            if (bookingTours[0].agent_name) {
              agentName = bookingTours[0].agent_name
            } else if (bookingTours[0].booking_agent_id) {
              agentName = await getAgentNameById(bookingTours[0].booking_agent_id)
            }

            // Use ship name from booking_tours if available
            if (bookingTours[0].ship_name) {
              shipName = bookingTours[0].ship_name
            }
          }

          return {
            ...booking,
            tour_guide: agentName,
            agent_name: agentName,
            ship_name: shipName,
          }
        } catch (error) {
          console.error(`Error fetching agent for recent booking ${booking.id}:`, error)
          return {
            ...booking,
            tour_guide: "No Guide",
            agent_name: "No Guide",
            ship_name: booking.ship_name || booking.primary_ship_name || "Unknown Ship",
          }
        }
      }),
    )

    return enhancedBookings
  } catch (error) {
    console.error("Error fetching recent bookings:", error)
    return []
  }
}

// Delete booking action
export async function deleteBookingAction(bookingId: string) {
  try {
    console.log(`Deleting booking with ID: ${bookingId}`)

    // First, delete any associated tours in the booking_tours table
    await executeQuery(`DELETE FROM booking_tours WHERE booking_id = $1`, [bookingId], { useCache: false })

    // Then delete the main booking record
    await executeQuery(`DELETE FROM bookings WHERE id = $1`, [bookingId], { useCache: false })

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/bookings")

    console.log(`Successfully deleted booking ${bookingId}`)
    return { success: true, message: "Booking deleted successfully" }
  } catch (error) {
    console.error("Error deleting booking:", error)
    return { success: false, message: "Failed to delete booking" }
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  try {
    const stats = await safeExecuteQuery(
      `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(total_payment) as total_revenue,
        SUM(deposit) as total_deposits
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      `,
      [],
      { useCache: true, timeout: 10000, retries: 2 },
    )

    return (
      stats[0] || {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        total_deposits: 0,
      }
    )
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      total_bookings: 0,
      confirmed_bookings: 0,
      pending_bookings: 0,
      total_revenue: 0,
      total_deposits: 0,
    }
  }
}

// Get upcoming tours
export async function getUpcomingTours(limit = 10) {
  try {
    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.tour_date,
        bt.adults,
        bt.children,
        bt.total_pax,
        bt.booking_agent_id,
        bt.ship_id,
        t.name as tour_name,
        COALESCE(bt_ships.name, t_ships.name) as ship_name,
        l.name as location,
        b.booking_reference,
        c.name as customer_name,
        ba.name as agent_name
      FROM 
        booking_tours bt
      LEFT JOIN 
        bookings b ON bt.booking_id = b.id
      LEFT JOIN 
        tours t ON bt.tour_id = t.id
      LEFT JOIN 
        ships bt_ships ON bt_ships.id = bt.ship_id
      LEFT JOIN
        ships t_ships ON t_ships.id = t.ship_id
      LEFT JOIN
        locations l ON t.location_id = l.id
      LEFT JOIN
        customers c ON b.customer_id = c.id
      LEFT JOIN
        booking_agents ba ON ba.id = bt.booking_agent_id
      WHERE 
        bt.tour_date >= CURRENT_DATE
      ORDER BY 
        bt.tour_date ASC
      LIMIT $1
      `,
      [limit],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    // Enhance with agent names if not already present
    const enhancedTours = await Promise.all(
      tours.map(async (tour) => {
        let agentName = "No Guide"

        if (tour.agent_name) {
          agentName = tour.agent_name
        } else if (tour.booking_agent_id) {
          agentName = await getAgentNameById(tour.booking_agent_id)
        }

        return {
          ...tour,
          tour_guide: agentName,
          agent_name: agentName,
          ship_name: tour.ship_name || "Unknown Ship",
        }
      }),
    )

    return enhancedTours || []
  } catch (error) {
    console.error("Error fetching upcoming tours:", error)
    return []
  }
}

// Enhanced fetchBookingById function with proper agent name resolution
export async function fetchBookingById(bookingId: string) {
  try {
    console.log(`Fetching booking ${bookingId} with enhanced data...`)

    const bookings = await safeExecuteQuery(
      `
      SELECT 
        b.id, 
        b.booking_reference, 
        b.tour_date, 
        b.status, 
        b.deposit, 
        b.remaining_balance,
        b.total_payment,
        b.created_at, 
        b.updated_at,
        b.adults,
        b.children,
        b.total_pax,
        b.commission,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net,
        b.notes,
        b.tour_id,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        ships.name as ship_name,
        l.name as location,
        (
          SELECT s.name 
          FROM booking_tours bt2 
          LEFT JOIN ships s ON s.id = bt2.ship_id 
          WHERE bt2.booking_id = b.id 
          AND s.name IS NOT NULL
          LIMIT 1
        ) as primary_ship_name
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      LEFT JOIN
        locations l ON t.location_id = l.id
      WHERE 
        b.id = $1
      `,
      [bookingId],
      { useCache: false, timeout: 10000, retries: 2 },
    )

    if (!bookings || bookings.length === 0) {
      console.log(`No booking found with ID ${bookingId}`)
      return null
    }

    const booking = bookings[0]

    // Fetch associated tours for this booking
    const tours = await fetchBookingTours(bookingId)

    // Get the primary booking agent from booking_tours
    let agentName = "No Guide"
    let shipName = booking.ship_name || booking.primary_ship_name || "Unknown Ship"

    try {
      const bookingTours = await safeExecuteQuery(
        `
        SELECT 
          bt.booking_agent_id,
          bt.ship_id,
          ba.name as agent_name,
          s.name as ship_name
        FROM booking_tours bt
        LEFT JOIN booking_agents ba ON ba.id = bt.booking_agent_id
        LEFT JOIN ships s ON s.id = bt.ship_id
        WHERE bt.booking_id = $1
        ORDER BY bt.created_at ASC
        LIMIT 1
        `,
        [bookingId],
        { useCache: false, timeout: 5000, retries: 1 },
      )

      if (bookingTours && bookingTours.length > 0) {
        if (bookingTours[0].agent_name) {
          agentName = bookingTours[0].agent_name
        } else if (bookingTours[0].booking_agent_id) {
          agentName = await getAgentNameById(bookingTours[0].booking_agent_id)
        }

        // Use ship name from booking_tours if available
        if (bookingTours[0].ship_name) {
          shipName = bookingTours[0].ship_name
        }
      }
    } catch (error) {
      console.error(`Error fetching agent for booking ${bookingId}:`, error)
    }

    const enhancedBooking = {
      ...booking,
      tours: tours,
      tour_guide: agentName,
      agent_name: agentName,
      ship_name: shipName,
    }

    console.log(`Enhanced booking ${bookingId} with agent name: ${agentName} and ship: ${shipName}`)
    return enhancedBooking
  } catch (error) {
    console.error(`Error fetching booking ${bookingId}:`, error)
    return null
  }
}

"use server"

import { executeQuery } from "@/lib/db"

export async function getBookingForReceipt(bookingId: string) {
  try {
    console.log("Fetching booking data for receipt, ID:", bookingId)

    // First, get the main booking information with customer details via join
    const bookingQuery = `
      SELECT 
        b.id, 
        b.booking_reference, 
        c.name as customer_name, 
        c.email, 
        c.phone, 
        a.name as agent_name, 
        b.commission, 
        b.status, 
        b.deposit as total_deposit, 
        b.remaining_balance as total_remaining_balance, 
        b.total_payment, 
        b.adults,
        b.children,
        b.total_pax,
        b.notes,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.created_at
      FROM 
        bookings b 
      JOIN
        customers c ON b.customer_id = c.id
      LEFT JOIN
        agents a ON b.agent_id = a.id
      WHERE 
        b.id = $1
    `

    const bookingResult = await executeQuery(bookingQuery, [bookingId])

    if (!bookingResult || bookingResult.length === 0) {
      console.error("No booking found with ID:", bookingId)
      return null
    }

    const booking = bookingResult[0]
    
    console.log("Main booking data:", {
      id: booking.id,
      adults: booking.adults,
      children: booking.children,
      total_pax: booking.total_pax
    })

    // Get all tours associated with this booking with ship information from ships table
    const toursQuery = `
      SELECT 
        bt.id, 
        bt.booking_id,
        bt.tour_id,
        bt.tour_date, 
        bt.adults, 
        bt.children, 
        bt.total_pax, 
        bt.price,
        bt.notes,
        bt.tour_guide,
        t.name as tour_name,
        t.ship_id,
        t.location_id,
        COALESCE(bt_ships.name, tour_ships.name, 'No Ship Assigned') as ship_name,
        COALESCE(l.name, 'Location Not Found') as location
      FROM 
        booking_tours bt
      JOIN
        tours t ON bt.tour_id = t.id
      LEFT JOIN
        ships bt_ships ON bt.ship_id = bt_ships.id
      LEFT JOIN
        ships tour_ships ON t.ship_id = tour_ships.id
      LEFT JOIN
        locations l ON t.location_id = l.id
      WHERE 
        bt.booking_id = $1
      ORDER BY
        bt.tour_date ASC
    `

    const toursResult = await executeQuery(toursQuery, [bookingId])
    console.log(`Found ${toursResult.length} tours for booking ${bookingId}`)

    // If no tours found in booking_tours, try to get the main tour from the booking
    if (toursResult.length === 0) {
      console.log("No tours found in booking_tours, checking main booking...")

      const mainTourQuery = `
        SELECT 
          b.id as booking_tour_id,
          b.tour_id,
          t.name as tour_name,
          t.ship_id,
          COALESCE(tour_ships.name, 'No Ship Assigned') as ship_name,
          COALESCE(l.name, 'Location Not Found') as location,
          b.tour_date,
          b.adults,
          b.children,
          b.total_pax,
          b.total_payment as price,
          b.tour_guide
        FROM 
          bookings b
        LEFT JOIN
          tours t ON b.tour_id = t.id
        LEFT JOIN
          ships tour_ships ON t.ship_id = tour_ships.id
        LEFT JOIN
          locations l ON t.location_id = l.id
        WHERE 
          b.id = $1 AND b.tour_id IS NOT NULL
      `

      const mainTourResult = await executeQuery(mainTourQuery, [bookingId])

      if (mainTourResult && mainTourResult.length > 0) {
        console.log(`Found main tour for booking ${bookingId}:`, mainTourResult[0])
        toursResult.push(mainTourResult[0])
      }
    }

    // Calculate total price from all tours
    const totalPrice = toursResult.reduce((sum, tour) => sum + Number(tour.price || 0), 0)

    // Process tours to calculate deposit and remaining_balance for each tour
    const tours = toursResult.map((tour, index) => {
      // Ensure price is a number
      const price = Number(tour.price) || 0

      // Calculate deposit and remaining balance for this tour based on the booking totals
      let deposit = 0
      let remaining_balance = 0

      if (totalPrice > 0) {
        // Calculate what percentage of the total price this tour represents
        const priceRatio = price / totalPrice

        // Apply this ratio to the total deposit and remaining balance
        deposit = Number((Number(booking.total_deposit) * priceRatio).toFixed(2))
        remaining_balance = Number((Number(booking.total_remaining_balance) * priceRatio).toFixed(2))
      }

      return {
        ...tour,
        price,
        deposit,
        remaining_balance,
      }
    })

    // Combine booking and tours data
    const result = {
      ...booking,
      tours,
    }

    console.log("Final booking data with tours:", {
      booking_reference: result.booking_reference,
      tours_count: result.tours.length,
      tours: result.tours.map((t) => ({ name: t.tour_name, ship: t.ship_name, date: t.tour_date })),
    })

    return result
  } catch (error) {
    console.error("Error fetching booking for receipt:", error)
    throw new Error(`Failed to fetch booking data: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function verifyReceipt(reference: string) {
  try {
    const query = `
      SELECT 
        b.id, 
        b.booking_reference, 
        c.name as customer_name, 
        c.email, 
        b.status, 
        b.deposit, 
        b.remaining_balance, 
        b.total_payment,
        b.created_at
      FROM 
        bookings b 
      JOIN
        customers c ON b.customer_id = c.id
      WHERE 
        b.booking_reference = $1
    `

    const result = await executeQuery(query, [reference])

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("Error verifying receipt:", error)
    throw new Error(`Failed to verify receipt: ${error instanceof Error ? error.message : String(error)}`)
  }
}

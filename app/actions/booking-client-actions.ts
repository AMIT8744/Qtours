"use server"

import { executeQuery, safeExecuteQuery } from "@/lib/db"
import { formatDateToYYYYMMDD } from "@/lib/date-utils"
import { getSession } from "./auth-actions"

// Client-safe functions that don't directly use revalidatePath

// Get all bookings with their associated tours - optimized query with error handling
export async function getBookings() {
  try {
    console.log("Fetching all bookings...")

    // Use a more efficient query with pagination and limit
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
        COALESCE(a.name, ba.name, 'Direct Booking') as agent_name,
        b.status,
        b.deposit,
        b.remaining_balance,
        b.total_payment,
        b.commission,
        b.adults,
        b.children,
        b.total_pax,
        t.name as tour_name,
        ships.name as ship_name,
        l.name as location,
        b.payment_location,
        COALESCE(b.tour_guide, ba.name, '') as tour_guide,
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
        booking_agents ba ON b.tour_guide = ba.name
      LEFT JOIN
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      LEFT JOIN
        locations l ON t.location_id = l.id
      ORDER BY 
        b.created_at DESC
      LIMIT 100
      `,
      [],
      { useCache: false }, // Disable caching to ensure real-time data
    )

    // Add a post-processing step to ensure all numeric fields are properly converted
    const processedBookings = bookings.map((booking) => ({
      ...booking,
      adults: Number(booking.adults) || 0,
      children: Number(booking.children) || 0,
      total_pax: Number(booking.total_pax) || 0,
      deposit: Number(booking.deposit) || 0,
      remaining_balance: Number(booking.remaining_balance) || 0,
      total_payment: Number(booking.total_payment) || 0,
      commission: Number(booking.commission) || 0,
      total_net: Number(booking.total_net) || Number(booking.total_payment) - Number(booking.commission) || 0,
    }))

    console.log(`Found ${bookings.length} bookings`)
    return processedBookings
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

// Get booking details with all associated tours
export async function getBookingById(id: string) {
  try {
    // Special case: if id is "new", return null (this is for the new booking page)
    if (!id || id === "new") {
      console.log(`Special case: ID is "${id}", returning null`)
      return null
    }

    console.log(`Fetching booking with ID: ${id}`)

    // Validate that id is a valid integer before querying the database
    if (!/^\d+$/.test(id)) {
      console.log(`Invalid booking ID format: ${id}`)
      return null
    }

    // Get the main booking information - don't cache individual booking details
    const bookings = await safeExecuteQuery(
      `
     SELECT 
       b.id, 
       b.booking_reference, 
       c.name as customer_name,
       c.id as customer_id,
       c.email,
       c.phone,
       a.name as agent_name,
       a.id as agent_id,
       b.status,
       b.deposit,
       b.remaining_balance,
       b.total_payment,
       b.commission,
       b.notes,
       b.tour_id,
       b.tour_date,
       b.adults,
       b.children,
       b.total_pax,
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
     WHERE
       b.id = $1
   `,
      [id],
      { useCache: false },
    )

    if (!bookings || bookings.length === 0) {
      console.log(`No booking found with ID: ${id}`)
      return null
    }

    const booking = bookings[0]
    console.log(`Found booking: ${booking.booking_reference}`)

    // Get all tours associated with this booking - ORDERED BY TOUR DATE with ALL FIELDS
    const tours = await safeExecuteQuery(
      `
     SELECT 
       bt.id,
       bt.tour_id,
       t.name as tour_name,
       ships.name as ship_name,
       l.name as location,
       bt.tour_date,
       bt.adults,
       bt.children,
       bt.total_pax,
       bt.price,
       bt.adult_price,
       bt.children_price,
       bt.deposit_amount as deposit,
       bt.remaining_balance,
       bt.booking_agent_id,
       bt.ship_id,
       bt.tour_guide,
       bt.notes,
       ba.name as booking_agent_name,
       ships2.name as ship_name_display,
       t.price as tour_price
     FROM 
       booking_tours bt
     LEFT JOIN 
       tours t ON bt.tour_id = t.id
     LEFT JOIN 
       ships ON ships.id = t.ship_id
     LEFT JOIN 
       locations l ON t.location_id = l.id
     LEFT JOIN
       booking_agents ba ON bt.booking_agent_id = ba.id
     LEFT JOIN
       ships ships2 ON bt.ship_id = ships2.id
     WHERE
       bt.booking_id = $1
     ORDER BY
       bt.tour_date ASC
   `,
      [id],
      { useCache: false },
    )

    console.log(`Found ${tours.length} tours for booking ${id}`)

    // If we have tours, get the main tour information from the first tour
    if (tours.length > 0) {
      console.log(`Using information from first tour: ${tours[0].tour_name}`)

      // Get the main tour information
      const mainTour = await safeExecuteQuery(
        `
       SELECT 
         t.name as tour_name,
         ships.name as ship_name,
         l.name as location
       FROM 
         tours t
       LEFT JOIN 
         ships ON ships.id = t.ship_id
       LEFT JOIN 
         locations l ON t.location_id = l.id
       WHERE
         t.id = $1
       `,
        [booking.tour_id],
        { useCache: true },
      )

      if (mainTour && mainTour.length > 0) {
        console.log(`Found main tour information: ${mainTour[0].tour_name}`)
        booking.tour_name = mainTour[0].tour_name
        booking.ship_name = mainTour[0].ship_name
        booking.location = mainTour[0].location
      } else if (tours.length > 0) {
        // If we couldn't get the main tour info, use the first tour's info
        console.log(`Using first tour as fallback: ${tours[0].tour_name}`)
        booking.tour_name = tours[0].tour_name
        booking.ship_name = tours[0].ship_name
        booking.location = tours[0].location
      }
    }

    // Process tours with all fields properly mapped
    const processedTours = tours.map((tour) => {
      // Calculate deposit and remaining balance if not available
      const price = Number(tour.price) || Number(tour.tour_price) || 0
      const adultPrice = Number(tour.adult_price) || 0
      const childrenPrice = Number(tour.children_price) || 0
      const deposit = Number(tour.deposit) || price * 0.3
      const remainingBalance = Number(tour.remaining_balance) || price - deposit

      return {
        ...tour,
        price,
        adult_price: adultPrice,
        children_price: childrenPrice,
        deposit,
        remaining_balance: remainingBalance,
        booking_agent_id: tour.booking_agent_id || "",
        ship_id: tour.ship_id || "",
        bookingAgentName: tour.booking_agent_name || "",
        shipName_display: tour.ship_name_display || tour.ship_name || "",
      }
    })

    // Combine booking info with tours
    const result = {
      ...booking,
      tours: processedTours,
    }

    console.log(`Returning booking with ${result.tours.length} tours and all fields:`, result)
    return result
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null // Return null instead of throwing to handle the error gracefully
  }
}

// Get booking tours
export async function getBookingTours(bookingId: string) {
  try {
    if (!bookingId) {
      return []
    }

    console.log(`Fetching tours for booking ID: ${bookingId}`)

    // First check if there are any tours in the booking_tours table
    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.tour_id,
        t.name as tour_name,
        ships.name as ship_name,
        l.name as location,
        bt.tour_date,
        bt.adults,
        bt.children,
        bt.total_pax,
        bt.price,
        bt.adult_price,
        bt.children_price,
        bt.deposit_amount as deposit,
        bt.remaining_balance,
        bt.booking_agent_id,
        bt.ship_id,
        bt.tour_guide,
        ba.name as booking_agent_name,
        ships2.name as ship_name_display
      FROM 
        booking_tours bt
      LEFT JOIN 
        tours t ON bt.tour_id = t.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      LEFT JOIN 
        locations l ON t.location_id = l.id
      LEFT JOIN
        booking_agents ba ON bt.booking_agent_id = ba.id
      LEFT JOIN
        ships ships2 ON bt.ship_id = ships2.id
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
          ships.name as ship_name,
          l.name as location,
          b.tour_date,
          b.adults,
          b.children,
          b.total_pax,
          b.total_payment as price,
          0 as adult_price,
          0 as children_price,
          b.deposit,
          b.remaining_balance,
          '' as booking_agent_id,
          '' as ship_id,
          b.tour_guide,
          '' as booking_agent_name,
          ships.name as ship_name_display
        FROM 
          bookings b
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
        { useCache: false },
      )

      if (mainTour && mainTour.length > 0) {
        console.log(`Found main tour in booking: ${mainTour[0].tour_name}`)
        return mainTour
      }

      console.log(`No tours found for booking ${bookingId}`)
      return []
    }

    console.log(`Found ${tours.length} tours for booking ${bookingId}`)
    return tours
  } catch (error) {
    console.error("Error fetching booking tours:", error)
    return []
  }
}

// Add this new function to handle multiple bookings
export async function createMultipleBookings(data: {
  bookings: Array<{
    tour_id: string
    tour_date: string
    adults: number
    children: number
    total_pax: number
    deposit: number
    remaining_balance: number
    total: number
    notes: string
  }>
  customer_name: string
  email: string
  phone: string
  agent_id: string
  notes: string
  payment_status: string
  commission: number
  payment_location?: string
  tour_guide?: string
  other?: string
  marketing_source?: string
}) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session || !session.user) {
      return { success: false, message: "You must be logged in to create bookings" }
    }

    // Validate required fields
    if (!data.customer_name) {
      return { success: false, message: "Customer name is required" }
    }
    if (!data.email) {
      return { success: false, message: "Customer email is required" }
    }
    if (!data.bookings || data.bookings.length === 0) {
      return { success: false, message: "At least one tour is required" }
    }

    // First, check if customer exists or create a new one
    let customerId
    const existingCustomers = await executeQuery("SELECT id FROM customers WHERE email = $1 LIMIT 1", [data.email], {
      useCache: false,
    })

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id
      // Update customer information
      await executeQuery(
        "UPDATE customers SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [data.customer_name, data.phone, customerId],
        { useCache: false },
      )
    } else {
      // Create new customer
      const newCustomer = await executeQuery(
        "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
        [data.customer_name, data.email, data.phone],
        { useCache: false },
      )
      customerId = newCustomer[0].id
    }

    // Extract new fields from data
    const paymentLocation = data.payment_location || ""
    const tourGuide = data.tour_guide || ""
    const other = data.other || ""
    const marketingSource = data.marketing_source || ""

    // Calculate totals for the entire booking
    const totalDeposit = data.bookings.reduce((sum, booking) => sum + booking.deposit, 0)
    const totalPayment = data.bookings.reduce((sum, booking) => sum + booking.total, 0)
    const totalRemainingBalance = totalPayment - totalDeposit

    // Generate a booking reference
    const bookingReference = `VDQ${Date.now().toString().slice(-6)}`

    // Find the earliest tour date to use as the main booking date
    const sortedDates = [...data.bookings]
      .filter((booking) => booking.tour_date) // Filter out any undefined dates
      .sort((a, b) => new Date(a.tour_date).getTime() - new Date(b.tour_date).getTime())

    // Use the earliest tour date, or today's date if no valid dates
    const earliestTourDate = sortedDates.length > 0 ? sortedDates[0].tour_date : formatDateToYYYYMMDD(new Date())

    // Get the first tour's details for the main booking record
    const firstTour = data.bookings[0]

    // Create the main booking record
    const booking = await executeQuery(
      `
      INSERT INTO bookings (
        booking_reference, customer_id, agent_id, 
        status, deposit, remaining_balance, 
        total_payment, commission, notes,
        tour_id, tour_date, adults, children, total_pax,
        payment_location, tour_guide, other, marketing_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18
      ) RETURNING id
    `,
      [
        bookingReference,
        customerId,
        data.agent_id === "direct" ? null : data.agent_id,
        data.payment_status,
        totalDeposit,
        totalRemainingBalance,
        totalPayment,
        data.commission,
        data.notes || "",
        firstTour.tour_id,
        earliestTourDate,
        firstTour.adults,
        firstTour.children,
        firstTour.total_pax,
        paymentLocation,
        tourGuide,
        other,
        marketingSource,
      ],
      { useCache: false },
    )

    const bookingId = booking[0].id

    // Create booking_tours entries for each tour
    for (const tour of data.bookings) {
      await executeQuery(
        `
        INSERT INTO booking_tours (
          booking_id, tour_id, tour_date, 
          adults, children, total_pax, 
          price
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        )
      `,
        [bookingId, tour.tour_id, tour.tour_date, tour.adults, tour.children, tour.total_pax, tour.total],
        { useCache: false },
      )
    }

    return {
      success: true,
      bookingId: bookingId,
      message: `Booking ${bookingReference} with ${data.bookings.length} tour(s) created successfully!`,
    }
  } catch (error) {
    console.error("Error creating multiple bookings:", error)
    return {
      success: false,
      message: "Failed to create bookings. Please try again.",
    }
  }
}

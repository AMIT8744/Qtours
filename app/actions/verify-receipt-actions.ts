"use server"

import { executeQuery } from "@/lib/db"

export async function verifyReceipt(reference: string) {
  try {
    // Clean and normalize the reference
    const cleanReference = reference.trim().toUpperCase()
    console.log("Verifying receipt with reference:", cleanReference)

    // Query the actual database for the booking with more flexible matching
    const bookingQuery = `
      SELECT 
        b.id, 
        b.booking_reference, 
        c.name as customer_name, 
        c.email, 
        c.phone,
        b.status, 
        b.deposit, 
        b.remaining_balance, 
        b.total_payment,
        b.adults,
        b.children,
        b.total_pax,
        b.created_at,
        b.notes
      FROM 
        bookings b 
      JOIN
        customers c ON b.customer_id = c.id
      WHERE 
        UPPER(TRIM(b.booking_reference)) = $1
        OR UPPER(TRIM(b.booking_reference)) = UPPER(TRIM($1))
    `

    const bookingResult = await executeQuery(bookingQuery, [cleanReference], {
      useCache: false,
      useMockOnFailure: false,
      retries: 3,
      timeout: 10000,
    })

    if (!bookingResult || bookingResult.length === 0) {
      console.log("No booking found for reference:", cleanReference)
      return {
        valid: false,
        message: `No booking found with reference "${cleanReference}". Please check the reference and try again.`,
      }
    }

    const booking = bookingResult[0]
    console.log("Found booking:", booking.booking_reference)

    // Get all tours associated with this booking
    const toursQuery = `
      SELECT 
        bt.id,
        bt.tour_date, 
        bt.adults, 
        bt.children, 
        bt.total_pax, 
        bt.price,
        bt.notes,
        bt.tour_guide,
        t.name as tour_name,
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

    const toursResult = await executeQuery(toursQuery, [booking.id], {
      useCache: false,
      useMockOnFailure: false,
      retries: 2,
    })

    // If no tours found in booking_tours, try to get the main tour from the booking
    let tours = toursResult || []

    if (tours.length === 0) {
      console.log("No tours found in booking_tours, checking main booking...")

      const mainTourQuery = `
        SELECT 
          b.id as booking_tour_id,
          b.tour_date,
          b.adults,
          b.children,
          b.total_pax,
          b.total_payment as price,
          b.tour_guide,
          t.name as tour_name,
          COALESCE(tour_ships.name, 'No Ship Assigned') as ship_name,
          COALESCE(l.name, 'Location Not Found') as location
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

      const mainTourResult = await executeQuery(mainTourQuery, [booking.id], {
        useCache: false,
        useMockOnFailure: false,
      })

      if (mainTourResult && mainTourResult.length > 0) {
        tours = mainTourResult
      }
    }

    // Format the response
    const verificationResult = {
      valid: true,
      booking: {
        reference: booking.booking_reference,
        customerName: booking.customer_name,
        email: booking.email,
        phone: booking.phone,
        status: booking.status,
        totalPayment: booking.total_payment,
        deposit: booking.deposit,
        remainingBalance: booking.remaining_balance,
        totalPassengers: booking.total_pax,
        createdAt: booking.created_at,
        notes: booking.notes,
        tours: tours.map((tour) => ({
          tourName: tour.tour_name || "Tour Name Not Available",
          shipName: tour.ship_name || "Ship Not Assigned",
          location: tour.location || "Location Not Available",
          tourDate: tour.tour_date,
          passengers: tour.total_pax || booking.total_pax,
          adults: tour.adults || booking.adults,
          children: tour.children || booking.children,
          price: tour.price || booking.total_payment,
          tourGuide: tour.tour_guide || "Not Assigned",
        })),
      },
    }

    console.log("Verification successful for:", booking.booking_reference)
    return verificationResult
  } catch (error) {
    console.error("Error verifying receipt:", error)

    // Provide specific error messages based on the error type
    let errorMessage = `Unable to verify receipt "${reference}". `

    if (error instanceof Error) {
      if (error.message.includes("connection") || error.message.includes("timeout")) {
        errorMessage += "Database connection issue. Please try again later."
      } else if (error.message.includes("not found") || error.message.includes("does not exist")) {
        errorMessage += "Booking reference not found in our records."
      } else {
        errorMessage += "Please check the reference and try again."
      }
    } else {
      errorMessage += "Please check the reference and try again."
    }

    return {
      valid: false,
      message: errorMessage,
    }
  }
}

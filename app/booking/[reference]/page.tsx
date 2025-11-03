import { executeQuery } from "@/lib/db"
import { notFound } from "next/navigation"
import BookingDetailsClient from "./booking-details-client"

interface BookingPageProps {
  params: {
    reference: string
  }
  searchParams: {
    payment?: string
  }
}

async function getBookingByReference(reference: string) {
  try {
    console.log("Searching for booking with reference:", reference)

    // Get the booking with all necessary fields including payment_id
    const booking = await executeQuery(
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
        b.notes,
        b.customer_id,
        b.tour_id,
        b.payment_id,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        t.description,
        ships.name as ship_name
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      WHERE 
        UPPER(b.booking_reference) = UPPER($1)
      `,
      [reference],
      { useCache: false },
    )

    console.log("Booking query result:", booking)

    if (booking.length === 0) {
      console.log("No booking found for reference:", reference)
      return null
    }

    const bookingData = booking[0]

    // Get tour pricing info separately if needed
    if (bookingData.tour_id) {
      try {
        const tourPricing = await executeQuery(`SELECT * FROM tours WHERE id = $1`, [bookingData.tour_id], {
          useCache: false,
        })

        if (tourPricing.length > 0) {
          const tour = tourPricing[0]
          // Add available pricing fields
          bookingData.price_per_person = tour.price_per_person || tour.price || 0
          bookingData.children_price = tour.children_price || tour.child_price || 0
        }
      } catch (tourError) {
        console.log("Error fetching tour pricing:", tourError)
        bookingData.price_per_person = 0
        bookingData.children_price = 0
      }
    }

    console.log("Final booking data:", bookingData)
    return bookingData
  } catch (error) {
    console.error("Error fetching booking:", error)

    // Fallback: try to get basic booking info
    try {
      console.log("Trying fallback query...")
      const fallbackBooking = await executeQuery(
        `SELECT b.*, c.name as customer_name, c.email, c.phone, t.name as tour_name
         FROM bookings b
         LEFT JOIN customers c ON b.customer_id = c.id  
         LEFT JOIN tours t ON b.tour_id = t.id
         WHERE UPPER(b.booking_reference) = UPPER($1)`,
        [reference],
        { useCache: false },
      )

      if (fallbackBooking.length > 0) {
        const booking = fallbackBooking[0]
        return {
          ...booking,
          price_per_person: 0,
          children_price: 0,
          ship_name: "",
        }
      }
    } catch (fallbackError) {
      console.error("Fallback query failed:", fallbackError)
    }

    return null
  }
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  console.log("BookingPage called with params:", params)

  const booking = await getBookingByReference(params.reference)

  if (!booking) {
    console.log("Booking not found, showing 404")
    notFound()
  }

  console.log("Rendering booking page with data:", booking)
  return <BookingDetailsClient booking={booking} paymentSuccess={searchParams.payment === "success"} />
}

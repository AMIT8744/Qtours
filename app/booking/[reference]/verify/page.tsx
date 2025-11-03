import { executeQuery } from "@/lib/db"
import { notFound } from "next/navigation"
import VerifyPaymentClient from "./verify-payment-client"

interface VerifyPaymentPageProps {
  params: {
    reference: string
  }
}

export default async function VerifyPaymentPage({ params }: VerifyPaymentPageProps) {
  try {
    // Await params for Next.js 15 compatibility
    const { reference } = await params
    console.log("Verifying payment for booking reference:", reference)

    // Get booking details - no authentication required for payment verification
    const bookingQuery = `
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
    `
    
    const bookingResult = await executeQuery(bookingQuery, [reference], { useCache: false })
    
    console.log("Booking query result:", bookingResult)
    
    if (!bookingResult || bookingResult.length === 0) {
      console.log("No booking found for reference:", reference)
      return notFound()
    }

    const booking = bookingResult[0]
    console.log("Found booking:", booking)

    return <VerifyPaymentClient booking={booking} />
  } catch (error) {
    console.error("Error in verify payment page:", error)
    return notFound()
  }
} 
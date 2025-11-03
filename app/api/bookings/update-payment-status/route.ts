import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Helper function to send booking confirmation email
async function sendBookingConfirmationEmail(booking: any) {
  try {
    // Import the email utility function
    const { sendBookingConfirmationEmail: sendEmail } = await import("@/lib/email-utils")
    
    const emailData = {
      reference: booking.booking_reference,
      customerName: booking.customer_name,
      tourName: booking.tour_name || "Tour",
      tourDate: new Date(booking.tour_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      totalAmount: booking.total_payment,
      passengers: booking.total_pax || booking.adults + (booking.children || 0),
    }

    const result = await sendEmail(booking.email, emailData)
    
    if (result.success) {
      console.log("✅ Booking confirmation email sent successfully:", result.emailId)
      return true
    } else {
      console.error("❌ Failed to send booking confirmation email:", result.error)
      return false
    }
  } catch (error) {
    console.error("💥 Error sending booking confirmation email:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingReference, status, paymentId, paymentDetails } = await request.json()

    if (!bookingReference || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // First check if booking exists and get full booking details for email
    const existingBooking = await sql`
      SELECT 
        b.id, 
        b.booking_reference, 
        b.status, 
        b.payment_id, 
        b.total_payment, 
        b.deposit, 
        b.remaining_balance,
        b.tour_date,
        b.adults,
        b.children,
        b.total_pax,
        c.name as customer_name,
        c.email,
        t.name as tour_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tours t ON b.tour_id = t.id
      WHERE UPPER(b.booking_reference) = UPPER(${bookingReference})
    `

    if (existingBooking.length === 0) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 })
    }

    const booking = existingBooking[0]
    const wasAlreadyPaid = booking.status?.toLowerCase() === "paid" || booking.status?.toLowerCase() === "confirmed"

    // Update booking status - only update payment_id if explicitly provided
    const updateQuery = paymentId
      ? sql`
          UPDATE bookings 
          SET 
            status = ${status},
            payment_id = ${paymentId},
            remaining_balance = CASE 
              WHEN ${status} = 'paid' THEN 0 
              ELSE remaining_balance 
            END,
            deposit = CASE 
              WHEN ${status} = 'paid' THEN total_payment 
              ELSE deposit 
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(booking_reference) = UPPER(${bookingReference})
          RETURNING id, booking_reference, status, total_payment, deposit, remaining_balance, payment_id
        `
      : sql`
          UPDATE bookings 
          SET 
            status = ${status},
            remaining_balance = CASE 
              WHEN ${status} = 'paid' THEN 0 
              ELSE remaining_balance 
            END,
            deposit = CASE 
              WHEN ${status} = 'paid' THEN total_payment 
              ELSE deposit 
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(booking_reference) = UPPER(${bookingReference})
          RETURNING id, booking_reference, status, total_payment, deposit, remaining_balance, payment_id
        `

    const result = await updateQuery

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to update booking - no rows affected" },
        { status: 500 },
      )
    }

    // Send confirmation email if payment status changed to paid and wasn't already paid
    if (status.toLowerCase() === "paid" && !wasAlreadyPaid && booking.email) {
      console.log("Sending booking confirmation email for payment success...")

      // Send email asynchronously - don't wait for it to complete
      sendBookingConfirmationEmail({
        ...booking,
        status: status,
        payment_id: paymentId || booking.payment_id,
      }).catch((error) => {
        console.error("Failed to send confirmation email:", error)
      })
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: result[0],
      emailSent: status.toLowerCase() === "paid" && !wasAlreadyPaid && booking.email ? true : false,
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

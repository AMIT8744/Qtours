import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingReference, amount, customerName, customerEmail, returnUrl } = body

    console.log("Creating simple payment for booking:", bookingReference)

    // Validate required fields
    if (!bookingReference || !amount) {
      return NextResponse.json({ error: "Booking reference and amount are required" }, { status: 400 })
    }

    // Get booking details
    const booking = await executeQuery("SELECT * FROM bookings WHERE booking_reference = $1", [bookingReference], {
      useCache: false,
    })

    if (booking.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const bookingData = booking[0]

    // Convert EUR to QAR for Dibsy payment (1 EUR = 4.20 QAR)
    const eurAmount = Number(amount)
    const qarAmount = Math.round(eurAmount * 4.2 * 100) / 100 // Convert to QAR and round to 2 decimal places
    const formattedQarAmount = qarAmount.toFixed(2)

    // Create payment with Dibsy API v2
    const paymentData = {
      amount: {
        value: formattedQarAmount,
        currency: "QAR",
      },
      description: `Payment for booking ${bookingReference}`,
      method: ["creditcard", "naps", "applepay", "googlepay"],
      sequenceType: "oneoff",
      redirectUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingReference}/verify`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      locale: "en_US",
      metadata: {
        booking_reference: bookingReference,
        booking_id: bookingData.id.toString(),
        customer_name: customerName || "Customer",
        customer_email: customerEmail || "",
        amount_eur: eurAmount.toFixed(2),
        amount_qar: formattedQarAmount,
      },
    }

    const response = await fetch("https://api.dibsy.one/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DIBSY_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    console.log("Dibsy API response:", result)

    if (!response.ok) {
      console.error("Dibsy API error:", result)
      return NextResponse.json(
        {
          error: result.title || result.message || "Payment creation failed",
          details: result,
        },
        { status: response.status },
      )
    }

    // Save the payment ID to the booking record
    if (result.id) {
      try {
        await executeQuery(
          `UPDATE bookings 
           SET payment_id = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE booking_reference = $2`,
          [result.id, bookingReference],
          { useCache: false },
        )
        console.log(`Saved payment ID ${result.id} to booking ${bookingReference}`)
      } catch (updateError) {
        console.error("Failed to save payment ID to booking:", updateError)
        // Continue with payment creation even if saving fails
      }
    }

    // Return the checkout URL for redirection
    if (result._links && result._links.checkout) {
          return NextResponse.json({
      success: true,
      paymentId: result.id,
      paymentUrl: result._links.checkout.href,
      status: result.status,
      amount: formattedQarAmount,
      currency: "QAR",
    })
    }

    // If no checkout link, return the payment details
    return NextResponse.json({
      success: true,
      paymentId: result.id,
      status: result.status,
      amount: formattedQarAmount,
      currency: "QAR",
      message: "Payment created successfully",
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

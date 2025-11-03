import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

interface DibsyPaymentResponse {
  id: string
  resource: string
  mode: string
  amount: {
    value: number
    currency: string
  }
  amountNet: {
    value: number
    currency: string
  }
  amountRemaining: {
    value: number
    currency: string
  }
  description: string
  method: string
  redirectUrl: string
  status: string
  organizationId: number
  sequenceType: string
  metadata: Record<string, any>
  details: {
    cardCountryCode: string
    cardHolder: string
    cardLabel: string
    cardNumber: string
  }
  createdAt: string
  expiresAt: string
  paidAt?: string
  _links: Record<string, any>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const bookingReference = searchParams.get("bookingReference")

    console.log("🔍 Dibsy Verification API called with:", {
      paymentId,
      bookingReference,
      url: request.url
    })

    if (!paymentId) {
      console.log("❌ Missing payment ID")
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
    }

    // Verify payment with Dibsy API
    const dibsyApiKey = process.env.DIBSY_SECRET_KEY
    if (!dibsyApiKey) {
      console.error("❌ DIBSY_SECRET_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const dibsyUrl = `https://api.dibsy.one/v2/payments/${paymentId}`
    console.log("🌐 Making Dibsy API request to:", dibsyUrl)
    console.log("🔑 Using API key:", dibsyApiKey.substring(0, 10) + "...")

    const dibsyResponse = await fetch(dibsyUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${dibsyApiKey}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Dibsy API Response Status:", {
      status: dibsyResponse.status,
      statusText: dibsyResponse.statusText,
      ok: dibsyResponse.ok
    })

    if (!dibsyResponse.ok) {
      console.error("Dibsy API error:", dibsyResponse.status, dibsyResponse.statusText)
      return NextResponse.json({ 
        error: "Failed to verify payment with payment provider",
        status: dibsyResponse.status 
      }, { status: dibsyResponse.status })
    }

    const paymentData: DibsyPaymentResponse = await dibsyResponse.json()

    console.log("📊 Dibsy Payment Data:", {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.amount,
      method: paymentData.method,
      description: paymentData.description,
      createdAt: paymentData.createdAt,
      paidAt: paymentData.paidAt,
      metadata: paymentData.metadata
    })

    // Check if payment was successful
    if (paymentData.status !== "succeeded") {
      console.log("❌ Payment not succeeded. Status:", paymentData.status)
      return NextResponse.json({
        success: false,
        paymentStatus: paymentData.status,
        message: `Payment status: ${paymentData.status}`,
      })
    }

    console.log("✅ Payment status is 'succeeded' - proceeding with booking update")

    // Find the booking associated with this payment
    let bookingQuery = `
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.total_amount,
        b.payment_status,
        c.name as customer_name,
        c.email,
        t.name as tour_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id  
      LEFT JOIN tours t ON b.tour_id = t.id
      WHERE b.payment_id = $1
      ORDER BY b.created_at DESC
      LIMIT 1
    `
    let queryParams = [paymentId]

    // If booking reference is provided, also search by it
    if (bookingReference) {
      bookingQuery = `
        SELECT 
          b.id,
          b.booking_reference,
          b.status,
          b.total_amount,
          b.payment_status,
          c.name as customer_name,
          c.email,
          t.name as tour_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id  
        LEFT JOIN tours t ON b.tour_id = t.id
        WHERE (b.payment_id = $1 OR b.booking_reference = $2)
        ORDER BY b.created_at DESC
        LIMIT 1
      `
      queryParams = [paymentId, bookingReference]
    }

    console.log("🔍 Searching for booking with query params:", queryParams)
    const booking = await executeQuery(bookingQuery, queryParams, { useCache: false })

    console.log("📋 Booking search result:", {
      found: booking.length > 0,
      count: booking.length,
      booking: booking.length > 0 ? {
        id: booking[0].id,
        reference: booking[0].booking_reference,
        status: booking[0].status,
        paymentStatus: booking[0].payment_status
      } : null
    })

    if (booking.length === 0) {
      console.log("❌ Booking not found for payment")
      return NextResponse.json({
        success: false,
        message: "Booking not found for this payment",
        paymentVerified: true,
        paymentData: {
          id: paymentData.id,
          status: paymentData.status,
          amount: paymentData.amount,
          paidAt: paymentData.paidAt,
        }
      })
    }

    const bookingData = booking[0]
    console.log("✅ Found booking:", {
      id: bookingData.id,
      reference: bookingData.booking_reference,
      currentStatus: bookingData.status,
      currentPaymentStatus: bookingData.payment_status
    })

    // Update booking payment status if needed
    if (bookingData.payment_status !== "paid") {
      console.log("🔄 Updating booking payment status to 'paid'")
      await executeQuery(
        `UPDATE bookings 
         SET payment_status = 'paid', 
             status = 'confirmed',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingData.id],
        { useCache: false }
      )
      console.log("✅ Booking status updated successfully")
    } else {
      console.log("ℹ️ Booking already marked as paid - no update needed")
    }

    const responseData = {
      success: true,
      paymentVerified: true,
      booking: {
        id: bookingData.id,
        bookingReference: bookingData.booking_reference,
        status: "confirmed",
        customerName: bookingData.customer_name,
        email: bookingData.email,
        tourName: bookingData.tour_name,
        totalAmount: bookingData.total_amount,
      },
      paymentData: {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.amount,
        paidAt: paymentData.paidAt,
        method: paymentData.method,
      },
      message: "Payment verified and booking confirmed",
    }

    console.log("🎉 Verification completed successfully!")
    console.log("📤 Returning response:", responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("Error verifying Dibsy payment:", error)
    return NextResponse.json({ 
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
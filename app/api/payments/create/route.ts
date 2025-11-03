import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardToken, amount, currency, customerInfo, bookingData, bookingReference, metadata } = body

    console.log("Creating payment with Dibsy:", {
      amount,
      currency,
      bookingReference,
      customerInfo: customerInfo ? `${customerInfo.firstName} ${customerInfo.lastName}` : "Unknown",
    })

    // Convert EUR to QAR (1 EUR = 4.20 QAR)
    const qarAmount = currency === "EUR" ? Math.round(amount * 4.2 * 100) : Math.round(amount * 100) // Amount in fils (QAR cents)
    
    console.log("Payment conversion:", {
      originalAmount: amount,
      currency: currency,
      qarAmount: qarAmount,
      qarAmountInQAR: qarAmount / 100, // Convert back to QAR for logging
    })

    const dibsyPayload = {
      amount: qarAmount, // Amount in fils (smallest currency unit)
      currency: "QAR",
      card_token: cardToken,
      metadata: {
        bookingReference: bookingReference || metadata?.bookingReference,
        customerName:
          metadata?.customerName || `${customerInfo?.firstName || ""} ${customerInfo?.lastName || ""}`.trim(),
        customerEmail: metadata?.customerEmail || customerInfo?.email,
        tourId: metadata?.tourId || bookingData?.tourId,
        tourDate: metadata?.tourDate || bookingData?.date,
        passengers: metadata?.passengers || bookingData?.totalPax,
        originalEurAmount: metadata?.originalEurAmount || amount,
        currency: currency || "EUR",
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingReference}/verify`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    }

    console.log("Dibsy payload:", dibsyPayload)

    const dibsyResponse = await fetch("https://api.dibsy.one/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DIBSY_SECRET_KEY}`,
      },
      body: JSON.stringify(dibsyPayload),
    })

    const dibsyData = await dibsyResponse.json()
    console.log("Dibsy API response:", dibsyData)

    if (!dibsyResponse.ok) {
      console.error("Dibsy API error:", dibsyData)
      return NextResponse.json(
        {
          success: false,
          error: dibsyData.message || `Dibsy API error (${dibsyResponse.status})`,
        },
        { status: dibsyResponse.status },
      )
    }

    // Check if 3D Secure authentication is required
    if (dibsyData.status === "requires_authentication" && dibsyData.redirect_url) {
      return NextResponse.json({
        success: true,
        requiresAuthentication: true,
        redirectUrl: dibsyData.redirect_url,
        paymentId: dibsyData.id,
      })
    }

    // Payment successful
    if (dibsyData.status === "paid") {
      // Update booking status immediately
      if (bookingReference) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/update-payment-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingReference,
              status: "paid",
              paymentId: dibsyData.id,
              paymentDetails: {
                amount: qarAmount,
                currency: "QAR",
                dibsyPaymentId: dibsyData.id,
              },
            }),
          })
        } catch (updateError) {
          console.error("Failed to update booking status:", updateError)
        }
      }

      return NextResponse.json({
        success: true,
        paymentId: dibsyData.id,
        status: dibsyData.status,
      })
    }

    // Handle other statuses
    return NextResponse.json({
      success: false,
      error: `Payment status: ${dibsyData.status}`,
      paymentId: dibsyData.id,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      },
      { status: 500 },
    )
  }
}

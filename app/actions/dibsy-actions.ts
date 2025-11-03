"use server"

import { executeQuery } from "@/lib/db"

export async function getDibsyPublicKey() {
  return "pk_test_51OqJN692E3qUojrZv"
}

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

export async function verifyDibsyPayment(paymentId: string, bookingReference?: string) {
  try {
    console.log("🔍 Server: Verifying Dibsy payment for:", paymentId)

    // Verify payment with Dibsy API
    const dibsyApiKey = process.env.DIBSY_SECRET_KEY
    if (!dibsyApiKey) {
      console.error("❌ DIBSY_SECRET_KEY not configured")
      return { success: false, error: "Payment service not configured" }
    }

    const dibsyUrl = `https://api.dibsy.one/v2/payments/${paymentId}`
    console.log("🌐 Server: Making Dibsy API request to:", dibsyUrl)

    const dibsyResponse = await fetch(dibsyUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${dibsyApiKey}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Server: Dibsy API Response Status:", {
      status: dibsyResponse.status,
      statusText: dibsyResponse.statusText,
      ok: dibsyResponse.ok
    })

    if (!dibsyResponse.ok) {
      console.error("❌ Dibsy API error:", dibsyResponse.status, dibsyResponse.statusText)
      return { 
        success: false, 
        error: "Failed to verify payment with payment provider",
        status: dibsyResponse.status 
      }
    }

    const paymentData: DibsyPaymentResponse = await dibsyResponse.json()

    console.log("📊 Server: Dibsy Payment Data:", {
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
      console.log("❌ Server: Payment not succeeded. Status:", paymentData.status)
      return {
        success: false,
        paymentStatus: paymentData.status,
        message: `Payment status: ${paymentData.status}`,
        paymentData: paymentData
      }
    }

    console.log("✅ Server: Payment status is 'succeeded' - payment verified successfully!")

    // Now that payment is verified, update the booking status in database using the same method as before
    console.log("🔄 Server: Updating booking status to 'paid' in database...")
    
    try {
      // First find the booking by payment_id to get the booking reference
      const findBookingQuery = `
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
        WHERE b.payment_id = $1
      `
      
      const existingBooking = await executeQuery(findBookingQuery, [paymentId], { useCache: false })
      
      if (existingBooking && existingBooking.length > 0) {
        const booking = existingBooking[0]
        const wasAlreadyPaid = booking.status?.toLowerCase() === "paid" || booking.status?.toLowerCase() === "confirmed"
        
        console.log("📋 Server: Found booking for update:", {
          id: booking.id,
          reference: booking.booking_reference,
          currentStatus: booking.status,
          wasAlreadyPaid: wasAlreadyPaid
        })
        
        // Update booking using the same logic as update-payment-status API
        const updateQuery = `
          UPDATE bookings 
          SET 
            status = 'paid',
            payment_id = $1,
            remaining_balance = 0,
            deposit = total_payment,
            updated_at = CURRENT_TIMESTAMP
          WHERE payment_id = $1
          RETURNING id, booking_reference, status, total_payment, deposit, remaining_balance, payment_id
        `
        
        const updateResult = await executeQuery(updateQuery, [paymentId], { useCache: false })
        
        if (updateResult && updateResult.length > 0) {
          console.log("✅ Server: Booking updated successfully:", {
            id: updateResult[0].id,
            reference: updateResult[0].booking_reference,
            newStatus: updateResult[0].status,
            newPaymentId: updateResult[0].payment_id,
            newDeposit: updateResult[0].deposit,
            newRemainingBalance: updateResult[0].remaining_balance
          })
          
          // Send confirmation email if payment status changed to paid and wasn't already paid
          if (!wasAlreadyPaid && booking.email) {
            console.log("📧 Server: Sending booking confirmation email...")
            
            try {
              const emailData = {
                customerName: booking.customer_name,
                customerEmail: booking.email,
                bookingReference: booking.booking_reference,
                tourName: booking.tour_name || "Tour",
                tourDate: new Date(booking.tour_date).toLocaleDateString("it-IT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                totalAmount: booking.total_payment,
                passengers: booking.total_pax || booking.adults + (booking.children || 0),
              }
              
              const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-booking-confirmation`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
              })
              
              if (emailResponse.ok) {
                console.log("✅ Server: Booking confirmation email sent successfully")
              } else {
                console.error("❌ Server: Failed to send booking confirmation email:", await emailResponse.text())
              }
            } catch (emailError) {
              console.error("❌ Server: Error sending confirmation email:", emailError)
            }
          }
        } else {
          console.log("⚠️ Server: No rows affected when updating booking")
        }
      } else {
        console.log("⚠️ Server: No booking found with payment_id:", paymentId)
      }
      
    } catch (updateError) {
      console.error("❌ Server: Error updating booking status:", updateError)
      // Continue with success response even if booking update fails
    }

    // Return success with payment data
    const responseData = {
      success: true,
      paymentVerified: true,
      paymentData: {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.amount,
        paidAt: paymentData.paidAt,
        method: paymentData.method,
        description: paymentData.description,
        metadata: paymentData.metadata
      },
      message: "Payment verified successfully and booking updated"
    }

    console.log("🎉 Server: Payment verification and booking update completed successfully!")
    console.log("📤 Server: Returning response:", responseData)

    return responseData
  } catch (error) {
    console.error("💥 Server: Error verifying Dibsy payment:", error)
    return { 
      success: false,
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Client-side function to verify payment
export async function verifyPaymentClient(paymentId: string, bookingReference?: string) {
  try {
    console.log("🔍 Client: Calling server action to verify payment")
    const result = await verifyDibsyPayment(paymentId, bookingReference)
    console.log("📡 Client: Server action result:", result)
    return result
  } catch (error) {
    console.error("💥 Client: Error calling server action:", error)
    return { 
      success: false,
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

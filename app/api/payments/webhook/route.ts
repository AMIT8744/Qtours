import { type NextRequest, NextResponse } from "next/server"
import { createMultipleBookings } from "@/app/actions/booking-actions"
import { getSystemSetting } from "@/app/actions/system-settings-actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get('dibsy-signature')
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { id, status, metadata, amount } = body

    console.log("Payment webhook received:", { id, status, metadata, amount })

    // Handle different payment statuses
    switch (status) {
      case "paid":
        // Payment successful - save booking to database
        console.log("Payment successful for booking:", metadata)

        try {
          // Extract customer data from metadata
          const customerData = {
            name: metadata.customerName || "Unknown Customer",
            email: metadata.customerEmail || "",
            phone: "", // Phone not included in current metadata, could be added
            payment_status: "paid", // This should be "paid" not "pending"
            notes: `Payment completed via Dibsy. Payment ID: ${id}`,
            payment_location: "Online Payment",
            other_information: `Dibsy Payment ID: ${id}`,
            commission: 0, // Set default commission or extract from metadata if available
          }

          // Store EUR amount directly (no conversion needed)
          const eurAmount = Number.parseFloat(metadata.originalEurAmount) || 0

          // Create booking data array
          const bookingsToCreate = [
            {
              tour_id: metadata.tourId,
              tour_date: metadata.tourDate,
              adults: Math.max(1, Number.parseInt(metadata.passengers) || 1), // Ensure at least 1 adult
              children: 0, // Default to 0, could be extracted from metadata if available
              total_pax: Number.parseInt(metadata.passengers) || 1,
              price: eurAmount, // Store EUR amount
              deposit: eurAmount, // Full payment as deposit in EUR
              remaining_balance: 0, // No remaining balance since fully paid
              tour_guide: "", // Could be added to metadata if needed
              notes: `Online booking via Dibsy payment system`,
              ship_id: null, // Could be extracted from tour data if needed
              booking_agent_id: null, // Online booking, no agent
            },
          ]

          console.log("Creating booking with data:", {
            customerData,
            bookingsToCreate,
          })

          // Save booking to database
          const result = await createMultipleBookings(customerData, bookingsToCreate)

          if (result.success) {
            console.log("Booking created successfully:", result)

            // Send confirmation email for new booking
            if (metadata.customerEmail) {
              try {
                // Import the email utility function
                const { sendBookingConfirmationEmail } = await import("@/lib/email-utils")
                
                const emailData = {
                  reference: metadata.bookingReference,
                  customerName: metadata.customerName || "Customer",
                  tourName: metadata.tourName || "Tour",
                  tourDate: metadata.tourDate,
                  totalAmount: eurAmount,
                  passengers: Number.parseInt(metadata.passengers) || 1,
                }

                const emailResult = await sendBookingConfirmationEmail(metadata.customerEmail, emailData)
                
                if (emailResult.success) {
                  console.log("✅ Booking confirmation email sent via webhook:", emailResult.emailId)
                } else {
                  console.error("❌ Failed to send booking confirmation email via webhook:", emailResult.error)
                }
              } catch (emailError) {
                console.error("💥 Error sending confirmation email via webhook:", emailError)
              }
            }

            // Send booking notification email to admin
            try {
              const notificationEmail = await getSystemSetting("booking_notifications_email")
              
              if (notificationEmail && notificationEmail.trim()) {
                console.log("📧 Sending booking notification email to admin:", notificationEmail)
                
                // Import and send notification email
                const { sendBookingNotificationEmail } = await import("@/lib/email-utils")
                
                const notificationData = {
                  reference: metadata.bookingReference || "WEBHOOK-" + id,
                  customerName: metadata.customerName || "Customer",
                  customerEmail: metadata.customerEmail || "",
                  tourName: metadata.tourName || "Tour",
                  tourDate: metadata.tourDate,
                  totalAmount: eurAmount,
                  passengers: Number.parseInt(metadata.passengers) || 1,
                  status: "paid"
                }

                const notificationResult = await sendBookingNotificationEmail(notificationEmail, notificationData)
                
                if (notificationResult.success) {
                  console.log("✅ Booking notification email sent to admin via webhook:", notificationResult.emailId)
                } else {
                  console.error("❌ Failed to send booking notification email to admin via webhook:", notificationResult.error)
                }
              } else {
                console.log("📧 No booking notification email configured, skipping admin notification")
              }
            } catch (notificationError) {
              console.error("💥 Error sending booking notification email to admin via webhook:", notificationError)
            }

            // If we have a booking reference from metadata, verify payment and update booking
            if (metadata.bookingReference) {
              console.log("Verifying payment and updating booking status:", metadata.bookingReference)

              try {
                // Verify payment with Dibsy API
                const verificationResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/verify-dibsy?paymentId=${id}&bookingReference=${metadata.bookingReference}`
                )
                const verificationResult = await verificationResponse.json()
                
                if (verificationResult.success) {
                  console.log("Payment verified successfully via webhook:", verificationResult)
                } else {
                  console.warn("Payment verification failed via webhook:", verificationResult)
                  // Still update booking status since we received the webhook
                  await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/update-payment-status`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        bookingReference: metadata.bookingReference,
                        status: "paid",
                        paymentId: id,
                        paymentDetails: {
                          amount: amount,
                          currency: metadata.currency || "QAR",
                          dibsyPaymentId: id,
                        },
                      }),
                    },
                  )
                }
              } catch (verificationError) {
                console.error("Payment verification error in webhook:", verificationError)
                // Fallback to direct update
                await fetch(
                  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/update-payment-status`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      bookingReference: metadata.bookingReference,
                      status: "paid",
                      paymentId: id,
                      paymentDetails: {
                        amount: amount,
                        currency: metadata.currency || "QAR",
                        dibsyPaymentId: id,
                      },
                    }),
                  },
                )
              }
            }
          } else {
            console.error("Failed to create booking:", result.message)
            // Don't return error to Dibsy - we still received the payment
            // Log the error for manual follow-up
          }
        } catch (bookingError) {
          console.error("Error creating booking from webhook:", bookingError)
          // Don't return error to Dibsy - we still received the payment
          // Log the error for manual follow-up
        }

        break

      case "failed":
        // Payment failed
        console.log("Payment failed for booking:", metadata)
        break

      case "cancelled":
        // Payment cancelled by user
        console.log("Payment cancelled for booking:", metadata)
        break

      case "expired":
        // Payment expired
        console.log("Payment expired for booking:", metadata)
        break

      default:
        console.log("Unknown payment status:", status)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

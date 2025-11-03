import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSystemSetting } from "@/app/actions/system-settings-actions"

// Generate a unique booking reference
function generateBookingReference(prefix = "VDQ"): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  return `${prefix}-${year}${month}${day}-${randomPart}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerInfo, bookingData } = body

    console.log("Creating pending booking with data:", JSON.stringify({ customerInfo, bookingData }, null, 2))

    // Validate input data
    if (!customerInfo.name || !customerInfo.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and email are required",
        },
        { status: 400 },
      )
    }

    if (!bookingData.tourId || !bookingData.date) {
      return NextResponse.json(
        {
          success: false,
          message: "Tour ID and date are required",
        },
        { status: 400 },
      )
    }

    // First, create or find the customer
    let customerId: string

    try {
      const existingCustomer = await executeQuery("SELECT id FROM customers WHERE email = $1", [customerInfo.email], {
        useCache: false,
        retries: 2,
        timeout: 10000,
        useMockOnFailure: true,
      })

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id
        // Update existing customer info
        await executeQuery(
          "UPDATE customers SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
          [customerInfo.name, customerInfo.phone || "", customerId],
          { useCache: false, retries: 2, useMockOnFailure: true },
        )
      } else {
        // Create new customer
        const customerResult = await executeQuery(
          `
          INSERT INTO customers (name, email, phone, created_at, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
          `,
          [customerInfo.name, customerInfo.email, customerInfo.phone || ""],
          { useCache: false, retries: 2, useMockOnFailure: true },
        )

        if (!customerResult || customerResult.length === 0) {
          throw new Error("Failed to create customer record")
        }

        customerId = customerResult[0].id
      }
    } catch (customerError) {
      console.error("Error handling customer:", customerError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create or update customer information. Please check your connection and try again.",
        },
        { status: 500 },
      )
    }

    // Generate booking reference
    const bookingReference = generateBookingReference()

    // Store EUR amount directly (no conversion needed)
    const eurAmount = Number(bookingData.totalPrice) || 0

    // Create the main booking record with pending status
    let bookingId: string
    try {
      const bookingResult = await executeQuery(
        `
        INSERT INTO bookings (
          customer_id, 
          booking_reference,
          tour_id, 
          tour_date, 
          adults, 
          children, 
          total_pax, 
          status, 
          notes, 
          deposit, 
          total_payment, 
          remaining_balance,
          payment_location,
          tour_guide,
          other,
          commission,
          created_at, 
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id
        `,
        [
          customerId,
          bookingReference,
          bookingData.tourId,
          bookingData.date,
          Number(bookingData.adults) || 0,
          Number(bookingData.children) || 0,
          Number(bookingData.totalPax) || 0,
          "pending", // Set status to pending
          bookingData.notes || "",
          0, // No deposit yet
          eurAmount, // Store EUR amount
          eurAmount, // Full amount remaining in EUR
          "", // No payment location yet
          "", // No tour guide assigned yet
          "", // No other information
          0, // No commission yet
        ],
        { useCache: false, retries: 2, useMockOnFailure: true },
      )

      if (!bookingResult || bookingResult.length === 0) {
        throw new Error("Failed to create booking record")
      }

      bookingId = bookingResult[0].id
      console.log(`Created pending booking with ID: ${bookingId}`)
    } catch (bookingError) {
      console.error("Error creating pending booking:", bookingError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create booking record. Please check your connection and try again.",
        },
        { status: 500 },
      )
    }

    // Insert tour into booking_tours table
    try {
      await executeQuery(
        `
        INSERT INTO booking_tours (
          booking_id, tour_id, tour_date, adults, children, total_pax, 
          price, tour_guide, notes, ship_id, booking_agent_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        `,
        [
          bookingId,
          bookingData.tourId,
          bookingData.date,
          Number(bookingData.adults) || 0,
          Number(bookingData.children) || 0,
          Number(bookingData.totalPax) || 0,
          eurAmount, // Store EUR amount
          "", // No tour guide assigned yet
          bookingData.notes || "",
          null, // No ship assigned yet
          null, // No booking agent yet
        ],
        { useCache: false, retries: 2, useMockOnFailure: true },
      )
      console.log(`Successfully inserted tour for booking ${bookingId}`)
    } catch (toursError) {
      console.error("Error creating tour booking:", toursError)
      // Don't fail completely if tours can't be inserted, but warn
      console.warn("Tour may not have been saved properly")
    }

    // Send booking notification email
    try {
      const notificationEmail = await getSystemSetting("booking_notifications_email")
      
      if (notificationEmail && notificationEmail.trim()) {
        console.log("📧 Sending booking notification email to:", notificationEmail)
        
        // Get tour details for the notification
        const tourResult = await executeQuery(
          "SELECT name FROM tours WHERE id = $1",
          [bookingData.tourId],
          { useCache: false, retries: 2, useMockOnFailure: true }
        )
        
        const tourName = tourResult && tourResult.length > 0 ? tourResult[0].name : "Tour"
        
        // Import and send notification email
        const { sendBookingNotificationEmail } = await import("@/lib/email-utils")
        
        const notificationData = {
          reference: bookingReference,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          tourName: tourName,
          tourDate: new Date(bookingData.date).toLocaleDateString("it-IT", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          totalAmount: eurAmount,
          passengers: Number(bookingData.totalPax) || Number(bookingData.adults) + Number(bookingData.children || 0),
          status: "pending"
        }

        const emailResult = await sendBookingNotificationEmail(notificationEmail, notificationData)
        
        if (emailResult.success) {
          console.log("✅ Booking notification email sent successfully:", emailResult.emailId)
        } else {
          console.error("❌ Failed to send booking notification email:", emailResult.error)
        }
      } else {
        console.log("📧 No booking notification email configured, skipping notification")
      }
    } catch (emailError) {
      console.error("💥 Error sending booking notification email:", emailError)
      // Don't fail the booking creation if email fails
    }

    return NextResponse.json({
      success: true,
      bookingId,
      booking_reference: bookingReference,
      message: `Booking created successfully with reference: ${bookingReference}`,
    })
  } catch (error) {
    console.error("Error creating pending booking:", error)

    let errorMessage = "Failed to create booking. Please try again."

    if (error instanceof Error) {
      if (error.message.includes("fetch failed") || error.message.includes("connection")) {
        errorMessage = "Database connection failed. Please check your internet connection and try again."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again with a stable connection."
      } else if (error.message.includes("invalid") || error.message.includes("constraint")) {
        errorMessage = "Invalid data provided. Please check your inputs and try again."
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    )
  }
}

"use server"

// This file is for server-only actions that use revalidatePath
// Client components should NOT import from this file directly

import { executeQuery, invalidateCache } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "./auth-actions"
import { getSystemSetting } from "./system-settings-actions"

// Add the missing getBookings function with all required fields
export async function getBookings() {
  try {
    const bookings = await executeQuery(
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
        b.commission,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
        ships.name as ship_name,
        (
          SELECT COUNT(*) 
          FROM booking_tours bt 
          WHERE bt.booking_id = b.id
        ) as tour_count
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        tours t ON b.tour_id = t.id
      LEFT JOIN
        ships ON ships.id = t.ship_id
      ORDER BY 
        b.tour_date ASC
      `,
      [],
    )
    return bookings
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

// Add the missing getBooking function (singular) for individual booking retrieval
export async function getBooking(id: string) {
  try {
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
        b.commission,
        b.payment_location,
        b.tour_guide,
        b.other,
        b.marketing_source,
        b.total_net,
        b.notes,
        b.customer_id,
        c.name as customer_name,
        c.email,
        c.phone,
        t.name as tour_name,
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
        b.id = $1
      `,
      [id],
      { useCache: false },
    )

    if (booking.length === 0) {
      return null
    }

    return booking[0]
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

// Helper function to create notifications directly in this file
async function createNotificationDirectly(userId: string, title: string, message: string, link?: string) {
  try {
    await executeQuery(
      `
     INSERT INTO notifications (user_id, title, message, link)
     VALUES ($1, $2, $3, $4)
   `,
      [userId, title, message, link],
    )
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false }
  }
}

// Update an existing booking - fix the function signature and validation
export async function updateBooking(bookingData: any) {
  try {
    // Get the current user session
    const session = await getSession()

    if (!session || !session.user) {
      return { success: false, message: "You must be logged in to update a booking" }
    }

    console.log("Updating booking with data:", JSON.stringify(bookingData, null, 2))

    // Validate required fields
    if (!bookingData.id) {
      return { success: false, message: "Booking ID is required" }
    }

    if (!bookingData.customer_name || bookingData.customer_name.trim() === "") {
      return { success: false, message: "Customer name is required" }
    }

    if (!bookingData.email || bookingData.email.trim() === "") {
      return { success: false, message: "Customer email is required" }
    }

    if (!bookingData.tours || bookingData.tours.length === 0) {
      return { success: false, message: "At least one tour is required" }
    }

    const { id, customer_name, email, phone, notes, payment_status, payment_location, other_information, tours } =
      bookingData

    // First, get the current booking to find the customer_id
    const currentBooking = await executeQuery("SELECT customer_id FROM bookings WHERE id = $1", [id], {
      useCache: false,
    })

    if (!currentBooking || currentBooking.length === 0) {
      return { success: false, message: "Booking not found" }
    }

    const customerId = currentBooking[0].customer_id

    // Update customer information
    await executeQuery(
      "UPDATE customers SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
      [customer_name.trim(), email.trim(), phone || "", customerId],
      { useCache: false },
    )

    // Calculate totals from tours
    const totalAmount = tours.reduce((sum: number, tour: any) => sum + (Number(tour.price) || 0), 0)
    const totalDeposit = tours.reduce((sum: number, tour: any) => sum + (Number(tour.deposit) || 0), 0)
    const totalRemainingBeforeCommission = tours.reduce(
      (sum: number, tour: any) => sum + (Number(tour.remaining_balance) || 0),
      0,
    )
    const commission = Number(bookingData.commission) || 0
    const totalRemaining = Math.max(0, totalRemainingBeforeCommission)
    const totalPax = tours.reduce((sum: number, tour: any) => sum + (Number(tour.total_pax) || 0), 0)
    const totalAdults = tours.reduce((sum: number, tour: any) => sum + (Number(tour.adults) || 0), 0)
    const totalChildren = tours.reduce((sum: number, tour: any) => sum + (Number(tour.children) || 0), 0)

    // Update the main booking record
    await executeQuery(
      `
      UPDATE bookings SET
        adults = $1,
        children = $2,
        total_pax = $3,
        status = $4,
        notes = $5,
        deposit = $6,
        total_payment = $7,
        remaining_balance = $8,
        payment_location = $9,
        other = $10,
        commission = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
    `,
      [
        totalAdults,
        totalChildren,
        totalPax,
        payment_status || "pending",
        notes || "",
        totalDeposit,
        totalAmount,
        totalRemaining,
        payment_location || "",
        other_information || "",
        Number(bookingData.commission) || 0, // Add this line
        id,
      ],
      { useCache: false },
    )

    // Delete existing booking_tours and recreate them
    await executeQuery("DELETE FROM booking_tours WHERE booking_id = $1", [id], { useCache: false })

    // Insert updated tours
    for (const tour of tours) {
      if (tour.tour_id && tour.tour_date) {
        await executeQuery(
          `
          INSERT INTO booking_tours (
            booking_id, tour_id, tour_date, adults, children, total_pax, 
            price, tour_guide, notes, ship_id, booking_agent_id, 
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          `,
          [
            id,
            tour.tour_id,
            tour.tour_date,
            Number(tour.adults) || 0,
            Number(tour.children) || 0,
            Number(tour.total_pax) || 0,
            Number(tour.price) || 0,
            tour.tour_guide || "",
            tour.notes || "",
            tour.ship_id || null,
            tour.booking_agent_id || null,
          ],
          { useCache: false },
        )
      }
    }

    // Invalidate relevant caches
    invalidateCache("bookings")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/bookings")
    revalidatePath(`/dashboard/bookings/${id}`)
    revalidatePath(`/dashboard/bookings/${id}/edit`)

    return {
      success: true,
      message: "Booking updated successfully!",
    }
  } catch (error) {
    console.error("Error updating booking:", error)
    return {
      success: false,
      message: `Failed to update booking: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function deleteBooking(id: string) {
  try {
    // First, delete any associated tours in the booking_tours table
    await executeQuery(
      `
      DELETE FROM booking_tours
      WHERE booking_id = $1
      `,
      [id],
    )

    // Then delete the main booking record
    await executeQuery(
      `
      DELETE FROM bookings
      WHERE id = $1
      `,
      [id],
    )

    // Use more specific revalidation to avoid full page refreshes
    // This will update the data without changing the user's position
    revalidatePath("/dashboard", "layout")
    revalidatePath("/dashboard/bookings", "layout")

    return { success: true, message: "Booking deleted successfully" }
  } catch (error) {
    console.error("Error deleting booking:", error)
    return { success: false, message: "Failed to delete booking" }
  }
}

// Generate a unique booking reference
function generateBookingReference(prefix = "REF"): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  return `${prefix}-${year}${month}${day}-${randomPart}`
}

// Add this new function to handle multiple bookings
export async function createMultipleBookings(customerData: any, bookingsToCreate: any[]) {
  try {
    console.log("Creating multiple bookings with data:", JSON.stringify({ customerData, bookingsToCreate }, null, 2))

    // Validate input data
    if (!bookingsToCreate || bookingsToCreate.length === 0) {
      return {
        success: false,
        message: "At least one tour booking is required",
      }
    }

    if (!customerData.name || !customerData.email) {
      return {
        success: false,
        message: "Customer name and email are required",
      }
    }

    // First, create or find the customer
    let customerId: string

    // Check if customer already exists with better error handling
    try {
      const existingCustomer = await executeQuery("SELECT id FROM customers WHERE email = $1", [customerData.email], {
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
          [customerData.name, customerData.phone || "", customerId],
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
          [customerData.name, customerData.email, customerData.phone || ""],
          { useCache: false, retries: 2, useMockOnFailure: true },
        )

        if (!customerResult || customerResult.length === 0) {
          throw new Error("Failed to create customer record")
        }

        customerId = customerResult[0].id
      }
    } catch (customerError) {
      console.error("Error handling customer:", customerError)
      return {
        success: false,
        message: "Failed to create or update customer information. Please check your connection and try again.",
      }
    }

    // Calculate totals with validation
    const totalDeposit = bookingsToCreate.reduce((sum, b) => sum + (Number(b.deposit) || 0), 0)
    const totalRemainingBeforeCommission = bookingsToCreate.reduce(
      (sum, b) => sum + (Number(b.remaining_balance) || 0),
      0,
    )
    const commission = Number(customerData.commission) || 0
    const totalRemaining = Math.max(0, totalRemainingBeforeCommission)
    const totalAmount = bookingsToCreate.reduce((sum, b) => sum + (Number(b.price) || 0), 0)
    const totalPax = bookingsToCreate.reduce((sum, b) => sum + (Number(b.total_pax) || 0), 0)
    const totalAdults = bookingsToCreate.reduce((sum, b) => sum + (Number(b.adults) || 0), 0)
    const totalChildren = bookingsToCreate.reduce((sum, b) => sum + (Number(b.children) || 0), 0)

    // Generate booking reference first
    const bookingReference = generateBookingReference()

    // Create the main booking record with better error handling
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
          bookingsToCreate[0]?.tour_id || null,
          bookingsToCreate[0]?.tour_date || null,
          totalAdults,
          totalChildren,
          totalPax,
          customerData.payment_status || "pending",
          customerData.notes || "",
          totalDeposit,
          totalAmount,
          totalRemaining,
          customerData.payment_location || "",
          bookingsToCreate[0]?.tour_guide || "",
          customerData.other_information || "",
          Number(customerData.commission) || 0, // Add this line
        ],
        { useCache: false, retries: 2, useMockOnFailure: true },
      )

      if (!bookingResult || bookingResult.length === 0) {
        throw new Error("Failed to create booking record")
      }

      bookingId = bookingResult[0].id
      console.log(`Created main booking with ID: ${bookingId}`)
    } catch (bookingError) {
      console.error("Error creating main booking:", bookingError)
      return {
        success: false,
        message: "Failed to create booking record. Please check your connection and try again.",
      }
    }

    // Insert all tours into booking_tours table with proper booking_agent_id
    try {
      for (let i = 0; i < bookingsToCreate.length; i++) {
        const booking = bookingsToCreate[i]
        console.log(`Inserting tour ${i + 1}:`, booking)

        // Ensure booking_agent_id is properly handled
        const bookingAgentId =
          booking.booking_agent_id && booking.booking_agent_id !== "" ? booking.booking_agent_id : null

        console.log(`Tour ${i + 1} booking_agent_id:`, bookingAgentId)

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
            booking.tour_id,
            booking.tour_date,
            Number(booking.adults) || 0,
            Number(booking.children) || 0,
            Number(booking.total_pax) || 0,
            Number(booking.price) || 0,
            booking.tour_guide || "",
            booking.notes || "",
            booking.ship_id || null,
            bookingAgentId, // This is the key fix - properly pass the booking_agent_id
          ],
          { useCache: false, retries: 2, useMockOnFailure: true },
        )
        console.log(`Successfully inserted tour ${i + 1} with booking_agent_id: ${bookingAgentId}`)
      }

      // Verify the number of tours inserted
      const toursCount = await executeQuery(
        `SELECT COUNT(*) as count FROM booking_tours WHERE booking_id = $1`,
        [bookingId],
        { useCache: false, retries: 1, useMockOnFailure: true },
      )
      console.log(`Verified tours count: ${toursCount[0]?.count || 0} (expected: ${bookingsToCreate.length})`)
    } catch (toursError) {
      console.error("Error creating tour bookings:", toursError)
      // Don't fail completely if tours can't be inserted, but warn the user
      console.warn("Some tours may not have been saved properly")
    }

    // Send booking notification email
    try {
      const notificationEmail = await getSystemSetting("booking_notifications_email")
      
      if (notificationEmail && notificationEmail.trim()) {
        console.log("📧 Sending booking notification email to admin:", notificationEmail)
        
        // Get tour details for the notification
        const tourResult = await executeQuery(
          "SELECT name FROM tours WHERE id = $1",
          [bookingsToCreate[0]?.tour_id],
          { useCache: false, retries: 2, useMockOnFailure: true }
        )
        
        const tourName = tourResult && tourResult.length > 0 ? tourResult[0].name : "Tour"
        
        // Import and send notification email
        const { sendBookingNotificationEmail } = await import("@/lib/email-utils")
        
        const notificationData = {
          reference: bookingReference,
          customerName: customerData.name,
          customerEmail: customerData.email,
          tourName: tourName,
          tourDate: bookingsToCreate[0]?.tour_date ? new Date(bookingsToCreate[0].tour_date).toLocaleDateString("it-IT", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : "Date not specified",
          totalAmount: totalAmount,
          passengers: totalPax,
          status: customerData.payment_status || "pending"
        }

        const emailResult = await sendBookingNotificationEmail(notificationEmail, notificationData)
        
        if (emailResult.success) {
          console.log("✅ Booking notification email sent to admin:", emailResult.emailId)
        } else {
          console.error("❌ Failed to send booking notification email to admin:", emailResult.error)
        }
      } else {
        console.log("📧 No booking notification email configured, skipping admin notification")
      }
    } catch (emailError) {
      console.error("💥 Error sending booking notification email to admin:", emailError)
      // Don't fail the booking creation if email fails
    }

    // Invalidate cache
    try {
      invalidateCache("bookings")
      revalidatePath("/dashboard/bookings")
      revalidatePath("/dashboard")
    } catch (cacheError) {
      console.warn("Cache invalidation failed:", cacheError)
      // Don't fail the operation for cache issues
    }

    return {
      success: true,
      bookingIds: [bookingId],
      message: `Booking created successfully with reference: ${bookingReference}`,
    }
  } catch (error) {
    console.error("Error creating bookings:", error)

    // Provide more specific error messages based on error type
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

    return {
      success: false,
      message: errorMessage,
    }
  }
}

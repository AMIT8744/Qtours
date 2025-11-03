"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSystemSetting(key: string) {
  try {
    console.log(`Fetching system setting: ${key}`)

    const result = await executeQuery("SELECT content FROM system_settings WHERE key = $1", [key])

    // Handle different result formats
    if (result && Array.isArray(result) && result.length > 0) {
      return result[0].content || ""
    }

    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0].content || ""
    }

    // Return default values if not found
    const defaults: Record<string, string> = {
      business_email: "info@viaggidelqatar.com",
      business_phone: "+974 xxxx xxxx",
      business_location: "Doha, Qatar",
      terms_and_conditions: "Terms and conditions have not been set yet. Please contact the administrator.",
      booking_notifications_email: "palma@qtours.tours",
      dibsy_mode: "sandbox",
    }

    return defaults[key] || ""
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error)

    // Return safe defaults on error
    const defaults: Record<string, string> = {
      business_email: "info@viaggidelqatsby.com",
      business_phone: "+974 xxxx xxxx",
      business_location: "Doha, Qatar",
      terms_and_conditions: "Terms and conditions have not been set yet. Please contact the administrator.",
      booking_notifications_email: "palma@qtours.tours",
      dibsy_mode: "sandbox",
    }

    return defaults[key] || ""
  }
}

export async function updateSystemSetting(key: string, content: string) {
  try {
    console.log(`Updating system setting: ${key}`)

    await executeQuery(
      `INSERT INTO system_settings (key, content) 
       VALUES ($1, $2) 
       ON CONFLICT (key) 
       DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, content],
    )

    revalidatePath("/dashboard/settings")
    revalidatePath("/terms")

    return { success: true }
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error)
    return { success: false, error: "Failed to update setting" }
  }
}

export async function updateBusinessSettings(formData: FormData) {
  try {
    const email = formData.get("business_email") as string
    const phone = formData.get("business_phone") as string
    const location = formData.get("business_location") as string

    if (!email || !phone || !location) {
      return { success: false, error: "All fields are required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Update all business settings
    const results = await Promise.all([
      updateSystemSetting("business_email", email),
      updateSystemSetting("business_phone", phone),
      updateSystemSetting("business_location", location),
    ])

    // Check if all updates were successful
    const allSuccessful = results.every((result) => result.success)

    if (allSuccessful) {
      return { success: true, message: "Business settings updated successfully" }
    } else {
      return { success: false, error: "Some settings failed to update" }
    }
  } catch (error) {
    console.error("Error updating business settings:", error)
    return { success: false, error: "Failed to update business settings" }
  }
}

export async function updateTermsAndConditions(formData: FormData) {
  try {
    const content = formData.get("terms_content") as string

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Terms and conditions cannot be empty" }
    }

    const result = await updateSystemSetting("terms_and_conditions", content.trim())

    if (result.success) {
      return { success: true, message: "Terms and conditions updated successfully" }
    } else {
      return { success: false, error: result.error || "Failed to update terms" }
    }
  } catch (error) {
    console.error("Error updating terms and conditions:", error)
    return { success: false, error: "Failed to update terms and conditions" }
  }
}

export async function updateBookingNotificationsEmail(formData: FormData) {
  try {
    const email = formData.get("booking_notifications_email") as string

    if (!email || email.trim().length === 0) {
      return { success: false, error: "Booking notifications email cannot be empty" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    const result = await updateSystemSetting("booking_notifications_email", email.trim())

    if (result.success) {
      return { success: true, message: "Booking notifications email updated successfully" }
    } else {
      return { success: false, error: result.error || "Failed to update booking notifications email" }
    }
  } catch (error) {
    console.error("Error updating booking notifications email:", error)
    return { success: false, error: "Failed to update booking notifications email" }
  }
}

export async function updateDibsyMode(formData: FormData) {
  try {
    const mode = formData.get("dibsy_mode") as string

    if (!mode || !["live", "sandbox"].includes(mode)) {
      return { success: false, error: "Dibsy mode must be either 'live' or 'sandbox'" }
    }

    const result = await updateSystemSetting("dibsy_mode", mode)

    if (result.success) {
      return { success: true, message: `Dibsy mode updated to ${mode} successfully` }
    } else {
      return { success: false, error: result.error || "Failed to update Dibsy mode" }
    }
  } catch (error) {
    console.error("Error updating Dibsy mode:", error)
    return { success: false, error: "Failed to update Dibsy mode" }
  }
}

"use server"

import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

type NotificationType = "booking" | "tour" | "system" | "payment"

export async function createNotification({
  userId,
  title,
  message,
  link = "",
  type = "system",
}: {
  userId: string
  title: string
  message: string
  link?: string
  type?: NotificationType
}) {
  try {
    const id = uuidv4()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO notifications (
        id, user_id, title, message, link, type, is_read, created_at
      ) VALUES (
        ${id}, ${userId}, ${title}, ${message}, ${link}, ${type}, false, ${now}
      )
    `

    return { success: true, id }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

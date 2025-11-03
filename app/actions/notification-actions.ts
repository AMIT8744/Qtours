// Update to use the correct column name "read" instead of "is_read"
import { safeExecuteQuery } from "@/lib/db"

export async function getNotifications(userId: string) {
  try {
    // Use safeExecuteQuery to handle connection errors gracefully
    const rows = await safeExecuteQuery(
      `
      SELECT id, title, message, link, read as is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
      [userId],
      {
        useCache: false, // Don't cache notifications to ensure they're always fresh
        useMockOnFailure: true, // Use mock data if the database connection fails
      },
    )

    return rows || []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

// Ensure markNotificationAsRead properly updates the database
export async function markNotificationAsRead(notificationId: string) {
  try {
    await safeExecuteQuery(
      `
      UPDATE notifications
      SET read = true
      WHERE id = $1
    `,
      [notificationId],
      { useMockOnFailure: true },
    )
    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

// Make sure deleteNotification properly removes the notification
export async function deleteNotification(notificationId: string) {
  try {
    await safeExecuteQuery(
      `
      DELETE FROM notifications
      WHERE id = $1
    `,
      [notificationId],
      { useMockOnFailure: true },
    )
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error: "Failed to delete notification" }
  }
}

// Add createNotification function to ensure it's available
export async function createNotification(userId: string, title: string, message: string, link?: string) {
  try {
    await safeExecuteQuery(
      `
      INSERT INTO notifications (user_id, title, message, link, read)
      VALUES ($1, $2, $3, $4, false)
    `,
      [userId, title, message, link],
      { useMockOnFailure: true },
    )
    return { success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false }
  }
}

// Add function to get unread notification count
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const result = await safeExecuteQuery(
      `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read = false
    `,
      [userId],
      {
        useCache: false, // Don't cache count to ensure it's always fresh
        useMockOnFailure: true, // Use mock data if the database connection fails
      },
    )

    return result[0]?.count ? Number.parseInt(result[0].count) : 0
  } catch (error) {
    console.error("Error fetching unread notification count:", error)
    return 0
  }
}

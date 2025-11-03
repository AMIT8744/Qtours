"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }

    // Log the attempt for debugging
    console.log(`Login attempt for email: ${email}`)

    // Use the correct table name
    const query = `
      SELECT id, email, name, role 
      FROM users 
      WHERE email = $1 AND password = $2
      LIMIT 1
    `

    // Execute the query with increased timeout and retries
    const users = await executeQuery(query, [email, password], {
      timeout: 15000,
      retries: 3,
      useCache: false,
    })

    // For debugging in production
    console.log(`Query executed, found ${users?.length || 0} matching users`)

    if (!users || users.length === 0) {
      return { success: false, message: "Invalid email or password" }
    }

    const user = users[0]

    // Set session cookie with proper configuration
    const oneWeek = 60 * 60 * 24 * 7

    // Set the user_id cookie (original implementation)
    cookies().set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: oneWeek,
      path: "/",
      sameSite: "lax",
    })

    // Also set a session cookie with more data
    cookies().set(
      "session",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: oneWeek,
        path: "/",
        sameSite: "lax",
      },
    )

    // Set a non-httpOnly cookie for client-side auth check
    cookies().set("authenticated", "true", {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === "production",
      maxAge: oneWeek,
      path: "/",
      sameSite: "lax",
    })

    console.log("Authentication successful, cookies set")

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    }
  }
}

export async function logout() {
  cookies().delete("user_id")
  cookies().delete("session")
  cookies().delete("authenticated")
  redirect("/")
}

export async function getSession() {
  try {
    // First try to get the session cookie
    let sessionCookie
    try {
      sessionCookie = cookies().get("session")?.value
    } catch (e) {
      console.warn("Error accessing cookies (getSession - session):", e)
      return null // Handle the error gracefully, e.g., return null or a default value
    }

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie)
        console.log("Session data from cookie:", sessionData)
        return { user: sessionData }
      } catch (e) {
        console.error("Error parsing session cookie:", e)
      }
    }

    // Fall back to the user_id cookie if session is not available
    let userId
    try {
      userId = cookies().get("user_id")?.value
    } catch (e) {
      console.warn("Error accessing cookies (getSession - user_id):", e)
      return null // Handle the error gracefully
    }
    if (!userId) {
      console.log("No user_id cookie found")
      return null
    }

    console.log("Using user_id cookie:", userId)

    // Fetch user data if we only have the user_id
    const query = `
      SELECT id, name, email, role 
      FROM users 
      WHERE id = $1 
      LIMIT 1
    `

    const users = await executeQuery(query, [userId], {
      useCache: true,
      retries: 2,
    })

    if (!users || users.length === 0) {
      // Clear invalid cookie
      try {
        cookies().delete("user_id")
      } catch (e) {
        console.warn("Error deleting cookie (getSession):", e)
      }
      console.log("No user found for user_id:", userId)
      return null
    }

    console.log("User found:", users[0])
    return { user: users[0] }
  } catch (error) {
    console.error("Session retrieval error:", error)
    return null
  }
}

export async function checkAuth() {
  const session = await getSession()
  if (!session) {
    console.log("No session found, redirecting to login")
    redirect("/")
  }
  return session
}

export async function updateUserEmail(userId: string, newEmail: string) {
  try {
    const result = await executeQuery(
      "UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email",
      [newEmail, userId]
    )
    
    if (result && result.length > 0) {
      return { success: true, user: result[0] }
    } else {
      return { success: false, error: "User not found" }
    }
  } catch (error) {
    console.error("Error updating user email:", error)
    return { success: false, error: "Failed to update email" }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const result = await executeQuery(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
      [newPassword, userId]
    )
    
    if (result && result.length > 0) {
      return { success: true }
    } else {
      return { success: false, error: "User not found" }
    }
  } catch (error) {
    console.error("Error updating user password:", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await executeQuery(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    )
    
    if (result && result.length > 0) {
      return result[0]
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

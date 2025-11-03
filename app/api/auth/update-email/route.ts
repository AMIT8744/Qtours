import { NextRequest, NextResponse } from "next/server"
import { checkAuth } from "@/app/actions/auth-actions"
import { updateUserEmail } from "@/app/actions/auth-actions"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if email already exists for another user
    const existingUser = await executeQuery(
      "SELECT id FROM users WHERE email = $1 AND id != $2 LIMIT 1",
      [email, session.user.id]
    )

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS"
      }, { status: 409 })
    }

    const result = await updateUserEmail(session.user.id, email)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Email updated successfully",
        user: result.user 
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
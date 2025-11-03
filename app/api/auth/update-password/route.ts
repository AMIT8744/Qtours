import { NextRequest, NextResponse } from "next/server"
import { checkAuth } from "@/app/actions/auth-actions"
import { updateUserPassword } from "@/app/actions/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()
    
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const result = await updateUserPassword(session.user.id, password)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Password updated successfully"
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
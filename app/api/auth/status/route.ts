import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sessionCookie = cookies().get("session")
    const authenticated = cookies().get("authenticated")

    if (!sessionCookie || !authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    // Don't return the actual session data for security
    return NextResponse.json({ authenticated: true }, { status: 200 })
  } catch (error) {
    console.error("Auth status check error:", error)
    return NextResponse.json({ authenticated: false, error: "Error checking authentication status" }, { status: 500 })
  }
}

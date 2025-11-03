import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Simple query to test database connection
    const result = await executeQuery("SELECT 1 as health_check", [], {
      timeout: 5000,
      retries: 2,
      useCache: false,
    })

    if (result && result.length > 0) {
      return NextResponse.json({ status: "ok", message: "Database connection successful" }, { status: 200 })
    } else {
      console.error("Health check failed: No result returned")
      return NextResponse.json({ status: "error", message: "Database connection failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      { status: "error", message: "Database connection error", error: String(error) },
      { status: 500 },
    )
  }
}

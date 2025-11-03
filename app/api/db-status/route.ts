import { checkDatabaseConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // No caching

export async function GET() {
  try {
    const status = await checkDatabaseConnection()

    return NextResponse.json({
      status: status.connected ? "ok" : "error",
      message: status.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Unknown error checking database connection",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

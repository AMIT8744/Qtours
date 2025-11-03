import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await executeQuery(`SELECT COUNT(*) as count FROM bookings`, [], { useCache: false })

    return NextResponse.json({ count: result[0]?.count || 0 })
  } catch (error) {
    console.error("Error fetching booking count:", error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}

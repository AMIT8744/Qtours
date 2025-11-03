import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { formatDateToYYYYMMDD } from "@/lib/date-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Fetching booking stats...")

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "all"

    console.log("📅 Period:", period)

    let whereClause = ""
    const params: any[] = []

    // Set date range based on period
    if (period !== "all") {
      const today = new Date()
      const todayFormatted = formatDateToYYYYMMDD(today)

      if (period === "today") {
        whereClause = "WHERE DATE(b.created_at) = $1"
        params.push(todayFormatted)
      } else if (period === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        const weekAgoFormatted = formatDateToYYYYMMDD(weekAgo)
        whereClause = "WHERE DATE(b.created_at) BETWEEN $1 AND $2"
        params.push(weekAgoFormatted, todayFormatted)
      } else if (period === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(today.getMonth() - 1)
        const monthAgoFormatted = formatDateToYYYYMMDD(monthAgo)
        whereClause = "WHERE DATE(b.created_at) BETWEEN $1 AND $2"
        params.push(monthAgoFormatted, todayFormatted)
      }
    }

    console.log("🔍 Where clause:", whereClause)
    console.log("📋 Params:", params)

    // Get booking statistics with better error handling
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(b.total_pax), 0) as total_passengers,
        COALESCE(SUM(b.total_payment), 0) as total_revenue,
        COALESCE(SUM(COALESCE(b.total_net, b.total_payment - COALESCE(b.commission, 0))), 0) as total_net,
        SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN b.status = 'paid' THEN 1 ELSE 0 END) as paid_bookings
      FROM 
        bookings b
      ${whereClause}
    `

    console.log("🔍 Executing stats query...")
    const statsResult = await executeQuery(statsQuery, params, { useCache: false })

    if (!statsResult || statsResult.length === 0) {
      console.log("⚠️ No stats data returned")
      return NextResponse.json({
        stats: {
          totalBookings: 0,
          totalPassengers: 0,
          totalRevenue: 0,
          totalNet: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          paidBookings: 0,
        },
      })
    }

    console.log("📊 Raw stats result:", statsResult[0])

    // Format the results with proper number conversion
    const rawStats = statsResult[0]
    const stats = {
      totalBookings: Number.parseInt(rawStats.total_bookings) || 0,
      totalPassengers: Number.parseInt(rawStats.total_passengers) || 0,
      totalRevenue: Number.parseFloat(rawStats.total_revenue) || 0,
      totalNet: Number.parseFloat(rawStats.total_net) || 0,
      confirmedBookings: Number.parseInt(rawStats.confirmed_bookings) || 0,
      pendingBookings: Number.parseInt(rawStats.pending_bookings) || 0,
      paidBookings: Number.parseInt(rawStats.paid_bookings) || 0,
    }

    console.log("✅ Formatted stats:", stats)

    return NextResponse.json({
      stats,
      period,
      success: true,
    })
  } catch (error) {
    console.error("❌ Error fetching booking stats:", error)

    // Return default stats on error
    return NextResponse.json(
      {
        stats: {
          totalBookings: 0,
          totalPassengers: 0,
          totalRevenue: 0,
          totalNet: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          paidBookings: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 200 },
    ) // Return 200 to prevent component errors
  }
}

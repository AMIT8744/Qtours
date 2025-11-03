import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export const dynamic = "force-dynamic" // No caching

export async function GET() {
  // Check if DATABASE_URL is defined
  const hasDbUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""

  // Check database connection
  const connectionStatus = await checkDatabaseConnection()

  return NextResponse.json({
    diagnostics: {
      environment: process.env.NODE_ENV || "unknown",
      hasDbUrl: hasDbUrl,
      databaseUrlLength: hasDbUrl ? process.env.DATABASE_URL!.length : 0,
      databaseUrlPrefix: hasDbUrl ? process.env.DATABASE_URL!.substring(0, 10) + "..." : "N/A",
      connectionStatus: connectionStatus,
      availableEnvVars: Object.keys(process.env).filter(
        (key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("DB_"),
      ),
      timestamp: new Date().toISOString(),
    },
  })
}

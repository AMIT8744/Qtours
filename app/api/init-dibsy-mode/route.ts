import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Check if dibsy_mode setting already exists
    const existingSetting = await executeQuery(
      "SELECT content FROM system_settings WHERE key = 'dibsy_mode'",
      [],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    if (existingSetting && existingSetting.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Dibsy mode setting already exists",
        currentMode: existingSetting[0].content
      })
    }

    // Insert dibsy_mode setting with default value
    await executeQuery(
      "INSERT INTO system_settings (key, content) VALUES ('dibsy_mode', 'sandbox')",
      [],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    return NextResponse.json({ 
      success: true, 
      message: "Dibsy mode setting initialized with 'sandbox' as default" 
    })

  } catch (error) {
    console.error("Error initializing dibsy mode setting:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize dibsy mode setting" },
      { status: 500 }
    )
  }
} 
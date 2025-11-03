"use server"

import { diagnoseDateFormats } from "./date-format-diagnostic"

export async function testDateFormats() {
  console.log(`[TEST] Starting date format diagnostic...`)

  const result = await diagnoseDateFormats()

  if (result.success) {
    console.log(`[TEST] Date format diagnostic completed successfully`)
    console.log(`[TEST] Check the detailed logs above for date format analysis`)

    return {
      success: true,
      message: "Date format diagnostic completed. Check console for detailed analysis.",
      data: result,
    }
  } else {
    console.error(`[TEST] Date format diagnostic failed:`, result.error)
    return {
      success: false,
      message: `Diagnostic failed: ${result.error}`,
    }
  }
}

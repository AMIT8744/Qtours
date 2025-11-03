"use server"

import { executeQuery } from "@/lib/db"

export async function debugServerDate() {
  try {
    // Check what the server thinks the current date is
    const dateQuery = `
      SELECT 
        CURRENT_DATE as server_current_date,
        CURRENT_TIMESTAMP as server_current_timestamp,
        NOW() as server_now,
        timezone('UTC', NOW()) as utc_now,
        to_char(CURRENT_DATE, 'YYYY-MM-DD') as formatted_current_date
    `

    const dateResult = await executeQuery(dateQuery, [], {
      useCache: false,
      timeout: 5000,
    })

    // Check sample tour dates
    const tourDatesQuery = `
      SELECT 
        tour_date,
        tour_date::date as tour_date_only,
        to_char(tour_date::date, 'YYYY-MM-DD') as tour_date_formatted,
        COUNT(*) as booking_count
      FROM booking_tours 
      GROUP BY tour_date, tour_date::date, to_char(tour_date::date, 'YYYY-MM-DD')
      ORDER BY tour_date::date DESC
      LIMIT 5
    `

    const tourDatesResult = await executeQuery(tourDatesQuery, [], {
      useCache: false,
      timeout: 5000,
    })

    return {
      success: true,
      serverDates: dateResult?.[0] || {},
      tourDates: tourDatesResult || [],
    }
  } catch (error) {
    console.error("Error debugging server date:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

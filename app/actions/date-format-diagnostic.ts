"use server"

import { executeQuery } from "@/lib/db"

export async function diagnoseDateFormats() {
  try {
    console.log(`[DIAGNOSTIC] Checking date formats in the database...`)

    // Check actual date formats in the database
    const dateFormatQuery = `
      SELECT 
        id,
        booking_reference,
        created_at,
        tour_date,
        -- Different date format extractions
        created_at::date as created_date_raw,
        DATE(created_at) as created_date_func,
        to_char(created_at, 'YYYY-MM-DD') as created_date_iso,
        to_char(created_at, 'DD-MM-YYYY') as created_date_eu,
        to_char(created_at, 'DD/MM/YYYY') as created_date_slash,
        -- Tour date formats
        tour_date::date as tour_date_raw,
        to_char(tour_date, 'YYYY-MM-DD') as tour_date_iso,
        to_char(tour_date, 'DD-MM-YYYY') as tour_date_eu,
        to_char(tour_date, 'DD/MM/YYYY') as tour_date_slash,
        -- Extract just the date part for comparison
        EXTRACT(YEAR FROM created_at) as created_year,
        EXTRACT(MONTH FROM created_at) as created_month,
        EXTRACT(DAY FROM created_at) as created_day,
        EXTRACT(YEAR FROM tour_date) as tour_year,
        EXTRACT(MONTH FROM tour_date) as tour_month,
        EXTRACT(DAY FROM tour_date) as tour_day
      FROM bookings 
      ORDER BY created_at DESC
      LIMIT 5
    `

    const dateFormats = await executeQuery(dateFormatQuery, [], {
      useCache: false,
      timeout: 10000,
    })

    console.log(`[DIAGNOSTIC] Sample booking date formats:`)
    dateFormats?.forEach((booking, index) => {
      console.log(`[DIAGNOSTIC] Booking ${index + 1}:`)
      console.log(`  - ID: ${booking.id}`)
      console.log(`  - Reference: ${booking.booking_reference}`)
      console.log(`  - Raw created_at: ${booking.created_at}`)
      console.log(`  - Raw tour_date: ${booking.tour_date}`)
      console.log(`  - created_date_raw (::date): ${booking.created_date_raw}`)
      console.log(`  - created_date_func (DATE()): ${booking.created_date_func}`)
      console.log(`  - created_date_iso (YYYY-MM-DD): ${booking.created_date_iso}`)
      console.log(`  - created_date_eu (DD-MM-YYYY): ${booking.created_date_eu}`)
      console.log(`  - created_date_slash (DD/MM/YYYY): ${booking.created_date_slash}`)
      console.log(`  - tour_date_iso (YYYY-MM-DD): ${booking.tour_date_iso}`)
      console.log(`  - tour_date_eu (DD-MM-YYYY): ${booking.tour_date_eu}`)
      console.log(`  - tour_date_slash (DD/MM/YYYY): ${booking.tour_date_slash}`)
      console.log(`  - Created: ${booking.created_day}/${booking.created_month}/${booking.created_year}`)
      console.log(`  - Tour: ${booking.tour_day}/${booking.tour_month}/${booking.tour_year}`)
      console.log(`---`)
    })

    // Check what format the UI is currently using by looking at recent bookings
    const uiFormatQuery = `
      SELECT 
        id,
        booking_reference,
        created_at,
        tour_date,
        to_char(created_at, 'DD/MM/YYYY') as ui_created_format,
        to_char(tour_date, 'DD/MM/YYYY') as ui_tour_format
      FROM bookings 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 3
    `

    const recentBookings = await executeQuery(uiFormatQuery, [], {
      useCache: false,
      timeout: 10000,
    })

    console.log(`[DIAGNOSTIC] Recent bookings (last 7 days) for UI format check:`)
    recentBookings?.forEach((booking) => {
      console.log(
        `  - ${booking.booking_reference}: Created ${booking.ui_created_format}, Tour ${booking.ui_tour_format}`,
      )
    })

    // Test different filter approaches with today's date
    const today = new Date()
    const todayISO = today.toISOString().split("T")[0] // YYYY-MM-DD
    const todayEU = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}` // DD-MM-YYYY
    const todaySlash = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}` // DD/MM/YYYY

    console.log(`[DIAGNOSTIC] Testing filter approaches with today's date:`)
    console.log(`  - Today ISO (YYYY-MM-DD): ${todayISO}`)
    console.log(`  - Today EU (DD-MM-YYYY): ${todayEU}`)
    console.log(`  - Today Slash (DD/MM/YYYY): ${todaySlash}`)

    const filterTests = [
      {
        name: "Filter by created_at::date = ISO format",
        query: `SELECT COUNT(*) as count FROM bookings WHERE created_at::date = $1::date`,
        param: todayISO,
      },
      {
        name: "Filter by DATE(created_at) = ISO format",
        query: `SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = $1`,
        param: todayISO,
      },
      {
        name: "Filter by to_char created_at = EU format",
        query: `SELECT COUNT(*) as count FROM bookings WHERE to_char(created_at, 'DD-MM-YYYY') = $1`,
        param: todayEU,
      },
      {
        name: "Filter by to_char created_at = Slash format",
        query: `SELECT COUNT(*) as count FROM bookings WHERE to_char(created_at, 'DD/MM/YYYY') = $1`,
        param: todaySlash,
      },
      {
        name: "Filter by tour_date = ISO format",
        query: `SELECT COUNT(*) as count FROM bookings WHERE tour_date = $1::date`,
        param: todayISO,
      },
    ]

    for (const test of filterTests) {
      try {
        const result = await executeQuery(test.query, [test.param], {
          useCache: false,
          timeout: 10000,
        })
        const count = result?.[0]?.count || 0
        console.log(`[DIAGNOSTIC] ${test.name} (${test.param}): ${count} bookings`)
      } catch (error) {
        console.log(`[DIAGNOSTIC] ${test.name}: ERROR - ${error}`)
      }
    }

    return {
      success: true,
      dateFormats,
      recentBookings,
      testFormats: {
        todayISO,
        todayEU,
        todaySlash,
      },
    }
  } catch (error) {
    console.error("[DIAGNOSTIC] Error checking date formats:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

"use server"

import { executeQuery } from "@/lib/db"

interface ExportParams {
  startDate: string
  endDate: string
  tourIds?: string[]
  checkOnly?: boolean
}

export async function exportFilteredBookings({ startDate, endDate, tourIds, checkOnly = false }: ExportParams) {
  try {
    // Handle tours filter
    if (tourIds && tourIds.length > 0) {
      console.log(`[SERVER] Export request for selected tours: ${tourIds.join(", ")}`)

      const tourIdsAsNumbers = tourIds.map((id) => Number.parseInt(id, 10)).filter((id) => !isNaN(id))

      if (tourIdsAsNumbers.length === 0) {
        return {
          success: false,
          message: "Invalid tour IDs provided.",
          recordCount: 0,
        }
      }

      const totalCountQuery = `
        SELECT COUNT(DISTINCT b.id) as total_count 
        FROM bookings b 
        JOIN booking_tours bt ON b.id = bt.booking_id
      `
      const totalResult = await executeQuery(totalCountQuery, [], {
        useCache: false,
        timeout: 10000,
      })
      const totalCount = totalResult?.[0]?.total_count || 0

      const filterTestQuery = `
        SELECT COUNT(DISTINCT b.id) as filtered_count 
        FROM bookings b 
        JOIN booking_tours bt ON b.id = bt.booking_id
        WHERE bt.tour_id = ANY($1::int[])
      `

      const filterTestResult = await executeQuery(filterTestQuery, [tourIdsAsNumbers], {
        useCache: false,
        timeout: 10000,
      })
      const filteredCount = filterTestResult?.[0]?.filtered_count || 0

      if (checkOnly) {
        return {
          success: filteredCount > 0,
          recordCount: filteredCount,
          message: filteredCount > 0 ? "Bookings found" : "No bookings found",
        }
      }

      if (filteredCount === 0) {
        return {
          success: false,
          message: `No bookings found for the selected tours.`,
          recordCount: 0,
        }
      }

      const mainQuery = `
        SELECT DISTINCT
          b.id,
          b.booking_reference,
          b.status,
          b.deposit,
          b.remaining_balance,
          b.total_payment,
          b.created_at,
          b.adults,
          b.children,
          b.total_pax,
          b.commission,
          b.payment_location,
          b.tour_guide,
          b.other,
          b.marketing_source,
          b.total_net,
          b.notes,
          c.name as customer_name,
          c.email,
          c.phone,
          MIN(bt.tour_date) as earliest_tour_date,
          to_char(b.created_at, 'YYYY-MM-DD') as created_date_formatted
        FROM 
          bookings b
        JOIN 
          booking_tours bt ON b.id = bt.booking_id
        LEFT JOIN 
          customers c ON b.customer_id = c.id
        WHERE bt.tour_id = ANY($1::int[])
        GROUP BY
          b.id, b.booking_reference, b.status, b.deposit, b.remaining_balance,
          b.total_payment, b.created_at, b.adults, b.children, b.total_pax,
          b.commission, b.payment_location, b.tour_guide, b.other,
          b.marketing_source, b.total_net, b.notes, c.name, c.email, c.phone
        ORDER BY 
          MIN(bt.tour_date) ASC
      `

      const bookings = await executeQuery(mainQuery, [tourIdsAsNumbers], {
        useCache: false,
        timeout: 30000,
      })

      if (!bookings || bookings.length === 0) {
        return {
          success: false,
          message: `No bookings found for the selected tours.`,
          recordCount: 0,
        }
      }

      return await generateExcelFromBookings(
        bookings,
        "",
        "",
        totalCount,
        tourIdsAsNumbers.map((id) => id.toString()),
      )
    }

    // Handle date-based filters (existing logic)
    console.log(`[SERVER] Export request for tour_date range: ${startDate} to ${endDate}`)

    // Debug what server thinks current date is
    const debugDateQuery = `
      SELECT 
        CURRENT_DATE as server_current_date,
        to_char(CURRENT_DATE, 'YYYY-MM-DD') as formatted_current_date
    `
    const debugDate = await executeQuery(debugDateQuery, [], { useCache: false, timeout: 5000 })
    console.log(
      `[SERVER] Server current date: ${debugDate?.[0]?.server_current_date}, formatted: ${debugDate?.[0]?.formatted_current_date}`,
    )

    const isAllExport = startDate === "1900-01-01" && endDate === "2099-12-31"
    const isTodayExport = startDate === endDate

    if (isAllExport) {
      console.log(`[SERVER] Exporting ALL bookings (no date filter)`)
    } else if (isTodayExport) {
      console.log(`[SERVER] Exporting TODAY bookings for date: ${startDate}`)
    }

    // Sample tour dates for debugging
    const debugQuery = `
      SELECT 
        bt.tour_date::date as tour_date_only,
        to_char(bt.tour_date::date, 'YYYY-MM-DD') as tour_date_formatted,
        COUNT(*) as booking_count
      FROM booking_tours bt 
      GROUP BY bt.tour_date::date, to_char(bt.tour_date::date, 'YYYY-MM-DD')
      ORDER BY bt.tour_date::date DESC
      LIMIT 10
    `

    const debugResults = await executeQuery(debugQuery, [], {
      useCache: false,
      timeout: 10000,
    })

    console.log(`[SERVER] Sample tour dates in database:`, debugResults)

    const totalCountQuery = `
      SELECT COUNT(DISTINCT b.id) as total_count 
      FROM bookings b 
      JOIN booking_tours bt ON b.id = bt.booking_id
    `
    const totalResult = await executeQuery(totalCountQuery, [], {
      useCache: false,
      timeout: 10000,
    })
    const totalCount = totalResult?.[0]?.total_count || 0

    // Build filter query based on export type
    let filterTestQuery: string
    let filterTestParams: any[]

    if (isAllExport) {
      filterTestQuery = `
        SELECT COUNT(DISTINCT b.id) as filtered_count 
        FROM bookings b 
        JOIN booking_tours bt ON b.id = bt.booking_id
      `
      filterTestParams = []
    } else if (isTodayExport) {
      // TODAY EXPORT - Use exact date match
      filterTestQuery = `
        SELECT COUNT(DISTINCT b.id) as filtered_count 
        FROM bookings b 
        JOIN booking_tours bt ON b.id = bt.booking_id
        WHERE bt.tour_date::date = $1::date
      `
      filterTestParams = [startDate]
      console.log(`[SERVER] TODAY filter: tour_date::date = '${startDate}'`)
    } else {
      // DATE RANGE EXPORT
      filterTestQuery = `
        SELECT COUNT(DISTINCT b.id) as filtered_count 
        FROM bookings b 
        JOIN booking_tours bt ON b.id = bt.booking_id
        WHERE bt.tour_date::date BETWEEN $1::date AND $2::date
      `
      filterTestParams = [startDate, endDate]
      console.log(`[SERVER] DATE RANGE filter: tour_date::date BETWEEN '${startDate}' AND '${endDate}'`)
    }

    const filterTestResult = await executeQuery(filterTestQuery, filterTestParams, {
      useCache: false,
      timeout: 10000,
    })
    const filteredCount = filterTestResult?.[0]?.filtered_count || 0

    console.log(`[SERVER] Bookings matching filter: ${filteredCount}`)

    if (filteredCount === 0) {
      return {
        success: false,
        message: `No bookings found with tour dates for the selected range (${startDate} to ${endDate}). Available dates: ${debugResults?.map((r) => r.tour_date_formatted).join(", ")}`,
        recordCount: 0,
      }
    }

    // Main query - build based on export type
    let mainQuery: string
    let mainQueryParams: any[]

    if (isAllExport) {
      mainQuery = `
        SELECT DISTINCT
          b.id,
          b.booking_reference,
          b.status,
          b.deposit,
          b.remaining_balance,
          b.total_payment,
          b.created_at,
          b.adults,
          b.children,
          b.total_pax,
          b.commission,
          b.payment_location,
          b.tour_guide,
          b.other,
          b.marketing_source,
          b.total_net,
          b.notes,
          c.name as customer_name,
          c.email,
          c.phone,
          MIN(bt.tour_date::date) as earliest_tour_date,
          to_char(b.created_at, 'YYYY-MM-DD') as created_date_formatted
        FROM 
          bookings b
        JOIN 
          booking_tours bt ON b.id = bt.booking_id
        LEFT JOIN 
          customers c ON b.customer_id = c.id
        GROUP BY
          b.id, b.booking_reference, b.status, b.deposit, b.remaining_balance,
          b.total_payment, b.created_at, b.adults, b.children, b.total_pax,
          b.commission, b.payment_location, b.tour_guide, b.other,
          b.marketing_source, b.total_net, b.notes, c.name, c.email, c.phone
        ORDER BY 
          MIN(bt.tour_date::date) ASC
      `
      mainQueryParams = []
    } else if (isTodayExport) {
      // TODAY EXPORT - exact date match
      mainQuery = `
        SELECT DISTINCT
          b.id,
          b.booking_reference,
          b.status,
          b.deposit,
          b.remaining_balance,
          b.total_payment,
          b.created_at,
          b.adults,
          b.children,
          b.total_pax,
          b.commission,
          b.payment_location,
          b.tour_guide,
          b.other,
          b.marketing_source,
          b.total_net,
          b.notes,
          c.name as customer_name,
          c.email,
          c.phone,
          MIN(bt.tour_date::date) as earliest_tour_date,
          to_char(b.created_at, 'YYYY-MM-DD') as created_date_formatted
        FROM 
          bookings b
        JOIN 
          booking_tours bt ON b.id = bt.booking_id
        LEFT JOIN 
          customers c ON b.customer_id = c.id
        WHERE bt.tour_date::date = $1::date
        GROUP BY
          b.id, b.booking_reference, b.status, b.deposit, b.remaining_balance,
          b.total_payment, b.created_at, b.adults, b.children, b.total_pax,
          b.commission, b.payment_location, b.tour_guide, b.other,
          b.marketing_source, b.total_net, b.notes, c.name, c.email, c.phone
        ORDER BY 
          MIN(bt.tour_date::date) ASC
      `
      mainQueryParams = [startDate]
    } else {
      // DATE RANGE EXPORT
      mainQuery = `
        SELECT DISTINCT
          b.id,
          b.booking_reference,
          b.status,
          b.deposit,
          b.remaining_balance,
          b.total_payment,
          b.created_at,
          b.adults,
          b.children,
          b.total_pax,
          b.commission,
          b.payment_location,
          b.tour_guide,
          b.other,
          b.marketing_source,
          b.total_net,
          b.notes,
          c.name as customer_name,
          c.email,
          c.phone,
          MIN(bt.tour_date::date) as earliest_tour_date,
          to_char(b.created_at, 'YYYY-MM-DD') as created_date_formatted
        FROM 
          bookings b
        JOIN 
          booking_tours bt ON b.id = bt.booking_id
        LEFT JOIN 
          customers c ON b.customer_id = c.id
        WHERE bt.tour_date::date BETWEEN $1::date AND $2::date
        GROUP BY
          b.id, b.booking_reference, b.status, b.deposit, b.remaining_balance,
          b.total_payment, b.created_at, b.adults, b.children, b.total_pax,
          b.commission, b.payment_location, b.tour_guide, b.other,
          b.marketing_source, b.total_net, b.notes, c.name, c.email, c.phone
        ORDER BY 
          MIN(bt.tour_date::date) ASC
      `
      mainQueryParams = [startDate, endDate]
    }

    const bookings = await executeQuery(mainQuery, mainQueryParams, {
      useCache: false,
      timeout: 30000,
    })

    console.log(`[SERVER] Main query returned ${bookings?.length || 0} bookings`)

    if (!bookings || bookings.length === 0) {
      return {
        success: false,
        message: `No bookings found with tour dates in the selected range.`,
        recordCount: 0,
      }
    }

    return await generateExcelFromBookings(bookings, startDate, endDate, totalCount)
  } catch (error) {
    console.error("[SERVER] Error exporting filtered bookings:", error)
    return {
      success: false,
      message: "Failed to export bookings. Please try again.",
      recordCount: 0,
    }
  }
}

async function generateExcelFromBookings(
  bookings: any[],
  startDate: string,
  endDate: string,
  totalCount: number,
  tourIds?: string[],
) {
  const bookingIds = bookings.map((b) => b.id)

  let tours = []
  if (bookingIds.length > 0) {
    let toursQuery = `
    SELECT 
      bt.booking_id,
      bt.tour_date::date as tour_date_only,
      to_char(bt.tour_date::date, 'YYYY-MM-DD') as tour_date_formatted,
      bt.adults,
      bt.children,
      bt.total_pax,
      bt.price,
      bt.tour_guide,
      bt.notes,
      t.name as tour_name,
      ships.name as ship_name,
      agents.name as booking_agent_name
    FROM 
      booking_tours bt
    LEFT JOIN 
      tours t ON bt.tour_id = t.id
    LEFT JOIN
      ships ON bt.ship_id = ships.id
    LEFT JOIN
      booking_agents agents ON bt.booking_agent_id = agents.id
    WHERE 
      bt.booking_id = ANY($1)
  `

    const toursQueryParams = [bookingIds]

    if (tourIds && tourIds.length > 0) {
      const tourIdsAsNumbers = tourIds.map((id) => Number.parseInt(id, 10)).filter((id) => !isNaN(id))
      toursQuery += ` AND bt.tour_id = ANY($2::int[])`
      toursQueryParams.push(tourIdsAsNumbers)
    } else if (startDate !== "1900-01-01" || endDate !== "2099-12-31") {
      if (startDate === endDate) {
        // TODAY export - exact date match
        toursQuery += ` AND bt.tour_date::date = $2::date`
        toursQueryParams.push(startDate)
      } else {
        // Date range export
        toursQuery += ` AND bt.tour_date::date BETWEEN $2::date AND $3::date`
        toursQueryParams.push(startDate, endDate)
      }
    }

    toursQuery += ` ORDER BY bt.tour_date::date ASC, bt.booking_id ASC`

    tours = await executeQuery(toursQuery, toursQueryParams, {
      useCache: false,
      timeout: 30000,
    })

    console.log(`[SERVER] Found ${tours.length} individual tours within filter criteria`)

    // Debug: Log the actual tour dates being returned
    tours.forEach((tour, index) => {
      console.log(
        `[SERVER] Tour ${index + 1}: booking_id=${tour.booking_id}, tour_date_formatted=${tour.tour_date_formatted}, tour_name=${tour.tour_name}`,
      )
    })
  }

  const toursByBooking: Record<string, any[]> = {}
  tours.forEach((tour) => {
    if (!toursByBooking[tour.booking_id]) {
      toursByBooking[tour.booking_id] = []
    }
    toursByBooking[tour.booking_id].push(tour)
  })

  const enrichedBookings = bookings.map((booking) => ({
    ...booking,
    tours: toursByBooking[booking.id] || [],
  }))

  enrichedBookings.sort((a, b) => {
    const dateA = new Date(a.earliest_tour_date || "1900-01-01")
    const dateB = new Date(b.earliest_tour_date || "1900-01-01")
    return dateA.getTime() - dateB.getTime()
  })

  // Generate Excel file using ExcelJS
  const ExcelJS = await import("exceljs")
  const workbook = new ExcelJS.default.Workbook()

  const now = new Date()
  workbook.creator = "Viaggi Del Qatar"
  workbook.lastModifiedBy = "Viaggi Del Qatar"
  workbook.created = now
  workbook.modified = now

  const worksheet = workbook.addWorksheet("Bookings Export", {
    properties: { tabColor: { argb: "FF6B0F1A" } },
  })

  worksheet.columns = [
    { header: "Booking #", key: "booking_ref", width: 22 },
    { header: "Tour Date", key: "tour_date", width: 16 },
    { header: "Ship", key: "ship", width: 18 },
    { header: "Tour Name", key: "tour_name", width: 28 },
    { header: "Customer", key: "customer", width: 22 },
    { header: "Adults", key: "adults", width: 10 },
    { header: "Children", key: "children", width: 10 },
    { header: "Total Pax", key: "total_pax", width: 12 },
    { header: "Deposit (€)", key: "deposit", width: 16 },
    { header: "Remaining (€)", key: "remaining", width: 18 },
    { header: "Total (€)", key: "total", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Email", key: "email", width: 32 },
    { header: "Commission (€)", key: "commission", width: 16 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Payment Location", key: "payment_location", width: 20 },
    { header: "Tour Guide", key: "tour_guide", width: 18 },
    { header: "Other", key: "other", width: 26 },
    { header: "Total NET (€)", key: "total_net", width: 16 },
    { header: "Created Date", key: "created_date", width: 16 },
  ]

  const headerRow = worksheet.getRow(1)
  headerRow.height = 22

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6B0F1A" },
    }
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: false,
    }
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    }
  })

  let currentRow = 2

  enrichedBookings.forEach((booking) => {
    const hasMultipleTours = booking.tours && booking.tours.length > 1

    if (booking.tours && booking.tours.length > 0) {
      booking.tours.sort((a, b) => {
        const dateA = new Date(a.tour_date_formatted || "1900-01-01")
        const dateB = new Date(b.tour_date_formatted || "1900-01-01")
        return dateA.getTime() - dateB.getTime()
      })

      const firstTour = booking.tours[0]

      const mainRowData = {
        booking_ref: booking.booking_reference || `REF-${booking.id}`,
        tour_date: firstTour.tour_date_formatted || "", // Use the pre-formatted date from SQL
        ship: firstTour.ship_name || "",
        tour_name: firstTour.tour_name || "",
        customer: booking.customer_name || "",
        adults: booking.adults || 0,
        children: booking.children || 0,
        total_pax: booking.total_pax || 0,
        deposit: Number.parseFloat(booking.deposit || 0),
        remaining: Number.parseFloat(booking.remaining_balance || 0),
        total: Number.parseFloat(booking.total_payment || 0),
        status: capitalizeFirst(booking.status || ""),
        email: booking.email || "",
        commission: Number.parseFloat(booking.commission || 0),
        phone: booking.phone || "",
        payment_location: booking.payment_location || "",
        tour_guide: booking.tour_guide || "",
        other: booking.other || "",
        total_net: Number.parseFloat(booking.total_net || 0),
        created_date: booking.created_date_formatted || formatDateSafe(booking.created_at),
      }

      console.log(`[SERVER] Excel row: booking=${mainRowData.booking_ref}, tour_date=${mainRowData.tour_date}`)

      const mainRow = worksheet.addRow(mainRowData)
      styleDataRow(mainRow, currentRow)
      currentRow++

      if (hasMultipleTours) {
        booking.tours.slice(1).forEach((tour, tourIndex) => {
          const tourRowData = {
            booking_ref: `  └ Tour ${tourIndex + 2}`,
            tour_date: tour.tour_date_formatted || "", // Use the pre-formatted date from SQL
            ship: tour.ship_name || "",
            tour_name: tour.tour_name || "",
            customer: "",
            adults: tour.adults || 0,
            children: tour.children || 0,
            total_pax: tour.total_pax || 0,
            deposit: Number.parseFloat(tour.price || 0),
            remaining: "",
            total: Number.parseFloat(tour.price || 0),
            status: "",
            email: "",
            commission: "",
            phone: "",
            payment_location: "",
            tour_guide: tour.tour_guide || "",
            other: tour.notes || "",
            total_net: "",
            created_date: "",
          }

          console.log(`[SERVER] Excel sub-tour row: tour_date=${tourRowData.tour_date}`)

          const tourRow = worksheet.addRow(tourRowData)
          styleDataRow(tourRow, currentRow, true)
          currentRow++
        })

        const separatorRow = worksheet.addRow({})
        styleDataRow(separatorRow, currentRow)
        currentRow++
      }
    } else {
      const mainRowData = {
        booking_ref: booking.booking_reference || `REF-${booking.id}`,
        tour_date: formatDateSafe(booking.earliest_tour_date),
        ship: "",
        tour_name: "",
        customer: booking.customer_name || "",
        adults: booking.adults || 0,
        children: booking.children || 0,
        total_pax: booking.total_pax || 0,
        deposit: Number.parseFloat(booking.deposit || 0),
        remaining: Number.parseFloat(booking.remaining_balance || 0),
        total: Number.parseFloat(booking.total_payment || 0),
        status: capitalizeFirst(booking.status || ""),
        email: booking.email || "",
        commission: Number.parseFloat(booking.commission || 0),
        phone: booking.phone || "",
        payment_location: booking.payment_location || "",
        tour_guide: booking.tour_guide || "",
        other: booking.other || "",
        total_net: Number.parseFloat(booking.total_net || 0),
        created_date: booking.created_date_formatted || formatDateSafe(booking.created_at),
      }

      const mainRow = worksheet.addRow(mainRowData)
      styleDataRow(mainRow, currentRow)
      currentRow++
    }
  })

  const currencyColumns = ["I", "J", "K", "N", "S"]
  currencyColumns.forEach((col) => {
    worksheet.getColumn(col).numFmt = '"€"#,##0.00'
  })

  const dateColumns = ["B", "T"]
  dateColumns.forEach((col) => {
    worksheet.getColumn(col).numFmt = "yyyy-mm-dd"
  })

  worksheet.views = [{ state: "frozen", ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const base64Data = Buffer.from(buffer).toString("base64")

  console.log(`[SERVER] Generated Excel with ${enrichedBookings.length} bookings, ordered by tour date ASC`)

  return {
    success: true,
    data: base64Data,
    recordCount: enrichedBookings.length,
    message: `Successfully exported ${enrichedBookings.length} bookings, ordered chronologically by tour date.`,
  }
}

function styleDataRow(row: any, rowNumber: number, isSubTour = false) {
  const isEvenRow = rowNumber % 2 === 0

  row.eachCell((cell: any) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      italic: isSubTour,
    }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isSubTour ? "FFF9F9F9" : isEvenRow ? "FFF5F5F5" : "FFFFFFFF" },
    }
    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
    }
    cell.border = {
      top: { style: "thin", color: { argb: "FFE0E0E0" } },
      left: { style: "thin", color: { argb: "FFE0E0E0" } },
      bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
      right: { style: "thin", color: { argb: "FFE0E0E0" } },
    }
  })

  const currencyColumnIndices = [9, 10, 11, 14, 19]
  currencyColumnIndices.forEach((colIndex) => {
    const cell = row.getCell(colIndex)
    if (cell) {
      cell.alignment = {
        vertical: "middle",
        horizontal: "right",
      }
    }
  })

  const numericColumnIndices = [6, 7, 8]
  numericColumnIndices.forEach((colIndex) => {
    const cell = row.getCell(colIndex)
    if (cell) {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      }
    }
  })
}

// Safe date formatting function that doesn't apply timezone conversion
function formatDateSafe(dateString: string | undefined): string {
  if (!dateString) return ""

  try {
    // If it's already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }

    // For timestamp strings, extract just the date part
    if (dateString.includes("T")) {
      return dateString.split("T")[0]
    }

    // For other formats, try to parse and format safely
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""

    // Use toISOString and extract date part to avoid timezone issues
    return date.toISOString().split("T")[0]
  } catch (error) {
    console.error(`[SERVER] Error formatting date: ${dateString}`, error)
    return ""
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

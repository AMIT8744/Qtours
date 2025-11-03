import { NextResponse } from "next/server"
import { safeExecuteQuery } from "@/lib/db"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("Exporting all bookings to Excel...")

    // Use safeExecuteQuery to handle database errors gracefully
    const bookings = await safeExecuteQuery(
      `
      SELECT 
        b.id, 
        b.booking_reference, 
        b.tour_date,
        b.adults,
        b.children,
        b.total_pax,
        b.deposit,
        b.remaining_balance,
        b.total_payment,
        b.commission,
        c.name as customer_name,
        c.email,
        c.phone,
        a.name as agent_name,
        b.payment_location,
        b.tour_guide,
        b.vehicles,
        b.other,
        b.marketing_source,
        b.total_net,
        t.name as tour_name,
        s.name as ship_name
      FROM 
        bookings b
      LEFT JOIN 
        customers c ON b.customer_id = c.id
      LEFT JOIN 
        agents a ON b.agent_id = a.id
      LEFT JOIN
        booking_tours bt ON b.id = bt.booking_id
      LEFT JOIN
        tours t ON bt.tour_id = t.id
      LEFT JOIN
        ships s ON t.ship_id = s.id
      ORDER BY 
        b.tour_date ASC
      `,
      [],
      { useCache: false },
    )

    // Format the data for Excel export
    const formattedBookings = bookings.map((booking: any) => {
      // Format date
      let tourDate = booking.tour_date
      try {
        if (booking.tour_date) {
          const date = new Date(booking.tour_date)
          tourDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        }
      } catch (e) {
        console.error("Error formatting date:", e)
      }

      // Format currency values with Euro symbol
      const formatEuro = (value: any) => {
        // Ensure value is a number
        let numValue = 0

        if (value !== null && value !== undefined) {
          // Convert to number if it's not already
          numValue = typeof value === "number" ? value : Number(value)

          // Check if conversion resulted in a valid number
          if (isNaN(numValue)) {
            console.warn(`Invalid numeric value: ${value}, defaulting to 0`)
            numValue = 0
          }
        }

        return `€${numValue.toFixed(2)}`
      }

      // Return formatted booking data
      return {
        "Tour Date": tourDate || "N/A",
        Ship: booking.ship_name || "N/A",
        "Tour Name": booking.tour_name || "N/A",
        Customer: booking.customer_name || "N/A",
        Adults: booking.adults || 0,
        Children: booking.children || 0,
        "Total Pax": booking.total_pax || 0,
        Deposit: formatEuro(booking.deposit),
        "Remaining Balance": formatEuro(booking.remaining_balance),
        "Total Payment": formatEuro(booking.total_payment),
        Email: booking.email || "N/A",
        Agent: booking.agent_name || "Direct",
        Commission: formatEuro(booking.commission),
        Phone: booking.phone || "N/A",
        "Payment Location": booking.payment_location || "N/A",
        "Tour Guide": booking.tour_guide || "N/A",
        Vehicles: booking.vehicles || "N/A",
        Other: booking.other || "",
        "Marketing Source": booking.marketing_source || "Direct",
        "Total NET": formatEuro(booking.total_net),
      }
    })

    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Create a worksheet from the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedBookings)

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Tour Date
      { wch: 15 }, // Ship
      { wch: 20 }, // Tour Name
      { wch: 25 }, // Customer
      { wch: 8 }, // Adults
      { wch: 8 }, // Children
      { wch: 10 }, // Total Pax
      { wch: 12 }, // Deposit
      { wch: 18 }, // Remaining Balance
      { wch: 15 }, // Total Payment
      { wch: 30 }, // Email
      { wch: 15 }, // Agent
      { wch: 15 }, // Commission
      { wch: 15 }, // Phone
      { wch: 18 }, // Payment Location
      { wch: 15 }, // Tour Guide
      { wch: 15 }, // Vehicles
      { wch: 25 }, // Other
      { wch: 18 }, // Marketing Source
      { wch: 15 }, // Total NET
    ]
    ws["!cols"] = columnWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Bookings")

    // Get current date for filename
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0] // YYYY-MM-DD format

    // Convert workbook to binary string
    const excelBinaryString = XLSX.write(wb, { bookType: "xlsx", type: "binary" })

    // Convert binary string to ArrayBuffer
    const buffer = new ArrayBuffer(excelBinaryString.length)
    const view = new Uint8Array(buffer)
    for (let i = 0; i < excelBinaryString.length; i++) {
      view[i] = excelBinaryString.charCodeAt(i) & 0xff
    }

    // Create response with Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="viaggi-del-qatar-bookings-${dateStr}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error in /api/bookings/export:", error)
    return NextResponse.json({ error: "Failed to export bookings" }, { status: 500 })
  }
}

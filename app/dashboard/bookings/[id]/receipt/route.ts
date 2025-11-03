import { getBookingForReceipt } from "@/app/actions/receipt-actions"
import generateReceiptPDF from "@/lib/pdf-generator"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    // Get booking data
    const booking = await getBookingForReceipt(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Generate PDF
    const pdfBlob = await generateReceiptPDF(booking)

    // Set headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", `attachment; filename="receipt-${booking.booking_reference || id}.pdf"`)

    return new NextResponse(pdfBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }
}

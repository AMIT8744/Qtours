"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { getBookingForReceipt } from "@/app/actions/receipt-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateReceiptPDF } from "@/lib/pdf-generator"

interface DownloadReceiptButtonProps {
  bookingId: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function DownloadReceiptButton({
  bookingId,
  variant = "outline",
  size = "default",
  className,
}: DownloadReceiptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      console.log("Fetching booking data for ID:", bookingId)

      if (!bookingId) {
        throw new Error("Booking ID is required")
      }

      // Fetch the booking data
      const booking = await getBookingForReceipt(bookingId)

      if (!booking) {
        throw new Error(`Booking not found with ID: ${bookingId}`)
      }

      console.log("Booking data received:", booking)

      // Validate and prepare booking data
      const bookingData = {
        id: booking.id || bookingId,
        booking_reference: booking.booking_reference || `REF-${bookingId}`,
        customer_name: booking.customer_name || "N/A",
        email: booking.email || "N/A",
        phone: booking.phone || "",
        status: booking.status || "pending",
        total_payment: Number(booking.total_payment) || 0,
        deposit: Number(booking.total_deposit) || 0,
        remaining_balance: Number(booking.total_remaining_balance) || 0,
        tour_name: booking.tours && booking.tours.length > 0 ? booking.tours[0].tour_name : "Multiple Tours",
        ship_name: booking.tours && booking.tours.length > 0 ? booking.tours[0].ship_name : "Various Ships",
        location: booking.tours && booking.tours.length > 0 ? booking.tours[0].location : "Various Locations",
        tour_date: booking.tours && booking.tours.length > 0 ? booking.tours[0].tour_date : null,
        adults: Number(booking.adults) || (booking.tours ? booking.tours.reduce((sum, tour) => sum + (Number(tour.adults) || 0), 0) : 0),
        children: Number(booking.children) || (booking.tours ? booking.tours.reduce((sum, tour) => sum + (Number(tour.children) || 0), 0) : 0),
        total_pax: Number(booking.total_pax) || (booking.tours ? booking.tours.reduce((sum, tour) => sum + (Number(tour.total_pax) || 0), 0) : 0),
        agent_name: booking.agent_name || "",
        commission: Number(booking.commission) || 0,
        notes: booking.notes || "",
        payment_location: booking.payment_location || "",
        tour_guide: booking.tour_guide || "",
        vehicles: booking.vehicles || "",
        other: booking.other || "",
        marketing_source: booking.marketing_source || "",
        total_net: Number(booking.total_net) || Number(booking.total_payment) - Number(booking.commission || 0),
        tours: booking.tours || [],
      }

      console.log("Generating PDF with validated data...")

      // Generate the PDF
      const blob = await generateReceiptPDF(bookingData)

      if (!blob) {
        throw new Error("Failed to generate PDF blob")
      }

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${bookingData.booking_reference}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("Receipt downloaded successfully")
    } catch (error) {
      console.error("Error generating receipt:", error)
      setError(`Failed to generate receipt: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Button variant={variant} size={size} onClick={handleDownload} disabled={isGenerating} className={className}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            <span>Download Receipt</span>
          </>
        )}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

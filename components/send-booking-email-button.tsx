"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { sendBookingInformationEmail } from "@/lib/email-utils"
import { useToast } from "@/components/ui/use-toast"

interface SendBookingEmailButtonProps {
  booking: {
    id: string
    booking_reference: string
    customer_name: string
    email: string
    total_payment: number
    total_pax: number
    status: string
    tours?: Array<{
      tour_name: string
      tour_date: string
      adults: number
      children: number
      total_pax: number
      price: number
      ship_name?: string
      tour_guide?: string
    }>
  }
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function SendBookingEmailButton({
  booking,
  variant = "ghost",
  size = "sm",
  className = ""
}: SendBookingEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendEmail = async () => {
    if (!booking.email) {
      toast({
        title: "Errore",
        description: "Nessun indirizzo email disponibile per questo cliente.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      // Prepare tour details if available
      const tourDetails = booking.tours?.map(tour => ({
        tourName: tour.tour_name,
        tourDate: new Date(tour.tour_date).toLocaleDateString("it-IT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        adults: tour.adults,
        children: tour.children,
        totalPax: tour.total_pax,
        price: tour.price,
        shipName: tour.ship_name,
        tourGuide: tour.tour_guide,
      }))

      // Use the first tour for basic info if no tour details available
      const firstTour = booking.tours?.[0]
      const tourName = firstTour?.tour_name || "Tour"
      const tourDate = firstTour?.tour_date 
        ? new Date(firstTour.tour_date).toLocaleDateString("it-IT", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Data non specificata"

      const emailResult = await sendBookingInformationEmail(booking.email, {
        reference: booking.booking_reference,
        customerName: booking.customer_name,
        customerEmail: booking.email,
        tourName: tourName,
        tourDate: tourDate,
        totalAmount: booking.total_payment,
        passengers: booking.total_pax,
        status: booking.status,
        tourDetails: tourDetails,
      })

      if (emailResult.success) {
        toast({
          title: "Email inviata",
          description: `Email di informazioni prenotazione inviata con successo a ${booking.email}`,
        })
      } else {
        toast({
          title: "Errore nell'invio",
          description: `Impossibile inviare l'email: ${emailResult.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending booking email:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio dell'email.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSendEmail}
      disabled={isSending || !booking.email}
      className={`flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 ${className}`}
      title={!booking.email ? "Nessun indirizzo email disponibile" : "Invia email con informazioni prenotazione"}
    >
      {isSending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      <span>{isSending ? "Invio..." : "Send Email"}</span>
    </Button>
  )
} 
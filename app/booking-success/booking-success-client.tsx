"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Calendar, Users, Mail, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"

interface BookingInfo {
  id: string
  booking_reference: string
  status: string
  customer_name: string
  email: string
  tour_name: string
}

export default function BookingSuccessClient() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")
  const email = searchParams.get("email")

  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    // Get stored payment info
    const storedPaymentInfo = sessionStorage.getItem("paymentInfo")
    if (storedPaymentInfo) {
      setPaymentInfo(JSON.parse(storedPaymentInfo))
    }

    // Verify booking creation
    if (paymentId && email) {
      verifyBooking()
    } else {
      setLoading(false)
      setError("Missing payment information")
    }
  }, [paymentId, email])

  const verifyBooking = async () => {
    try {
      const response = await fetch(
        `/api/bookings/verify-payment?paymentId=${paymentId}&email=${encodeURIComponent(email!)}`,
      )
      const result = await response.json()

      if (result.success) {
        setBooking(result.booking)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error verifying booking:", err)
      setError("Failed to verify booking. Please contact support.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Processing Your Booking</h2>
          <p className="text-gray-600">Please wait while we confirm your reservation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {booking ? (
          // Success State
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-lg text-gray-600">Thank you for your booking. Your reservation has been confirmed.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                    <p className="text-lg font-semibold">{booking.booking_reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg font-semibold capitalize text-green-600">{booking.status}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Tour</label>
                  <p className="text-lg font-semibold">{booking.tour_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="text-lg">{booking.customer_name}</p>
                  <p className="text-sm text-gray-600">{booking.email}</p>
                </div>

                {paymentInfo?.bookingData && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(parseISO(paymentInfo.bookingData.date), "EEEE, MMMM d, yyyy")}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {paymentInfo.bookingData.adults} Adult{paymentInfo.bookingData.adults > 1 ? "s" : ""}
                        {paymentInfo.bookingData.children > 0 &&
                          `, ${paymentInfo.bookingData.children} Child${paymentInfo.bookingData.children > 1 ? "ren" : ""}`}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>What's Next?</strong>
                <ul className="mt-2 space-y-1">
                  <li>• You will receive a confirmation email shortly</li>
                  <li>• Our team will contact you 24-48 hours before your tour</li>
                  <li>• Please arrive 15 minutes before the scheduled departure time</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Button asChild size="lg">
                <Link href="/">Book Another Tour</Link>
              </Button>

              <div className="text-sm text-gray-600">
                <p>Need help? Contact us:</p>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>info@viaggidelqatar.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>+974 XXXX XXXX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Error State
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Processing</h1>
              <p className="text-lg text-gray-600">
                {error || "We're still processing your booking. Please check back in a few minutes."}
              </p>
            </div>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  "Your payment was successful, but we're still creating your booking record. Please contact support if this persists."}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Button onClick={verifyBooking} variant="outline">
                Check Again
              </Button>

              <div className="text-sm text-gray-600">
                <p>Payment ID: {paymentId}</p>
                <p>If you continue to see this message, please contact support with the payment ID above.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

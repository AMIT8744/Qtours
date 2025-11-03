"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users, MapPin, Ship, CreditCard, CheckCircle, Clock, AlertCircle, ArrowLeft, Download, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BookingDetailsClientProps {
  booking: any
  paymentSuccess?: boolean
}

export default function BookingDetailsClient({ booking: initialBooking, paymentSuccess }: BookingDetailsClientProps) {
  const [booking, setBooking] = useState(initialBooking)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)
  const router = useRouter()

  const updateBookingToPaid = async (bookingReference: string) => {
    try {
      console.log("Updating booking status to paid for:", bookingReference)

      const response = await fetch("/api/bookings/update-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference: bookingReference,
          status: "paid",
          paymentId: null,
          paymentDetails: {
            automatic: true,
            timestamp: new Date().toISOString(),
            source: "payment_success_redirect",
          },
        }),
      })

      const result = await response.json()
      console.log("Auto payment update result:", result)

      if (response.ok && result.success) {
        // Update local booking state
        setBooking((prev) => ({
          ...prev,
          status: "paid",
          payment_id: result.booking.payment_id,
          remaining_balance: 0,
          deposit: prev.total_payment,
        }))

        // Show email confirmation message if email was sent
        if (result.emailSent) {
          console.log("Booking confirmation email sent successfully")
        }

        return true
      } else {
        console.error("Failed to update booking status:", result.message)
        return false
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      return false
    }
  }

  // Auto-update booking status when payment is successful
  useEffect(() => {
    if (paymentSuccess && booking.status?.toLowerCase() !== "paid") {
      const autoUpdatePayment = async () => {
        setIsRefreshing(true)
        try {
          console.log("Auto-updating booking status due to payment success")

          // Wait a moment for any webhooks to process first
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Update the booking status to paid
          const updated = await updateBookingToPaid(booking.booking_reference)

          if (updated) {
            console.log("Booking status updated successfully")
            // Refresh the page to get the latest data
            setTimeout(() => {
              router.refresh()
            }, 2000)
          } else {
            console.log("Failed to update booking status, refreshing page anyway")
            setTimeout(() => {
              router.refresh()
            }, 1000)
          }
        } catch (error) {
          console.error("Error in auto-update process:", error)
          // Still refresh the page to get any updates from webhooks
          setTimeout(() => {
            router.refresh()
          }, 1000)
        } finally {
          setIsRefreshing(false)
        }
      }

      autoUpdatePayment()
    } else if (paymentSuccess) {
      // If already paid, just refresh to ensure we have latest data
      setIsRefreshing(true)
      setTimeout(() => {
        router.refresh()
        setIsRefreshing(false)
      }, 1000)
    }
  }, [paymentSuccess, booking.booking_reference, booking.status, router])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handlePayment = async () => {
    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      console.log("Creating payment for booking:", booking.booking_reference)

      // Create payment with Dibsy
      const response = await fetch("/api/payments/create-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference: booking.booking_reference,
          amount: booking.remaining_balance || booking.total_payment, // This is now in EUR
          customerName: booking.customer_name,
          customerEmail: booking.email,
          returnUrl: `${window.location.origin}/booking/${booking.booking_reference}/verify`,
        }),
      })

      const paymentData = await response.json()
      console.log("Payment API response:", paymentData)

      if (!response.ok) {
        throw new Error(paymentData.error || `Payment creation failed (${response.status})`)
      }

      if (paymentData.success && paymentData.paymentUrl) {
        console.log("Redirecting to payment URL:", paymentData.paymentUrl)
        // Redirect to Dibsy checkout page
        window.location.href = paymentData.paymentUrl
      } else {
        throw new Error(paymentData.message || "No payment URL received")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentError(error instanceof Error ? error.message : "Failed to process payment. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const refreshBookingStatus = async () => {
    setIsRefreshing(true)
    try {
      router.refresh()
    } catch (error) {
      console.error("Error refreshing:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloadingReceipt(true)
      console.log("📄 Downloading receipt for booking:", booking.id)

      // Import receipt functions dynamically
      const { getBookingForReceipt } = await import("@/app/actions/receipt-actions")
      const { generateReceiptPDF } = await import("@/lib/pdf-generator")

      // Get booking data for receipt
      const bookingData = await getBookingForReceipt(booking.id)
      
      if (!bookingData) {
        throw new Error("Could not fetch booking data for receipt")
      }

      console.log("📋 Booking data for receipt:", bookingData)

      // Generate PDF
      const blob = await generateReceiptPDF(bookingData)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${booking.booking_reference}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("✅ Receipt downloaded successfully")
    } catch (error) {
      console.error("❌ Error downloading receipt:", error)
      alert(`Failed to download receipt: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsDownloadingReceipt(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {paymentSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Payment Successful!</strong> Your booking has been confirmed and a confirmation email has been
              sent to your email address.
              {isRefreshing && (
                <span className="block mt-1 text-sm">
                  <Clock className="inline w-3 h-3 mr-1" />
                  Updating booking status...
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {paymentError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Booking Details</CardTitle>
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                    {getStatusIcon(booking.status)}
                    {booking.status || "Pending"}
                  </Badge>
                </div>
                <p className="text-gray-600">Reference: {booking.booking_reference}</p>
                {booking.payment_id && <p className="text-sm text-gray-500">Payment ID: {booking.payment_id}</p>}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{booking.customer_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{booking.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{booking.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tour Information */}
                <div>
                  <h3 className="font-semibold mb-3">Tour Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{booking.tour_name || "Tour"}</span>
                    </div>
                    {booking.ship_name && (
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4 text-gray-500" />
                        <span>{booking.ship_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(booking.tour_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {booking.adults || 0} Adults
                        {booking.children > 0 && `, ${booking.children} Children`} (Total:{" "}
                        {booking.total_pax || booking.adults + booking.children})
                      </span>
                    </div>
                  </div>
                  {booking.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{booking.description}</p>
                    </div>
                  )}
                </div>

                {booking.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-gray-600">{booking.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount</span>
                    <span className="font-medium">EUR {booking.total_payment || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>≈ QAR</span>
                    <span>{(booking.total_payment || 0) * 4.2}</span>
                  </div>
                  {booking.deposit > 0 && (
                    <div className="flex justify-between">
                      <span>Deposit Paid</span>
                      <span className="text-green-600">EUR {booking.deposit}</span>
                    </div>
                  )}
                  {booking.remaining_balance > 0 && (
                    <div className="flex justify-between">
                      <span>Remaining Balance</span>
                      <span className="font-medium text-red-600">EUR {booking.remaining_balance}</span>
                    </div>
                  )}
                  {booking.remaining_balance > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>≈ QAR</span>
                      <span className="text-red-600">{(booking.remaining_balance || 0) * 4.2}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Only show payment section if booking is not paid and has remaining balance */}
                {booking.status?.toLowerCase() !== "paid" &&
                  booking.status?.toLowerCase() !== "confirmed" &&
                  booking.remaining_balance > 0 && (
                    <div className="space-y-3">
                      {!showPaymentForm ? (
                        <Button onClick={() => setShowPaymentForm(true)} className="w-full" size="lg">
                          Complete Payment
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2">
                              <strong>Amount to pay:</strong> EUR {booking.remaining_balance}
                            </p>
                            <p className="text-sm text-blue-700 mb-1">
                              ≈ QAR {(booking.remaining_balance || 0) * 4.2}
                            </p>
                            <p className="text-xs text-blue-600">
                              You will be redirected to our secure payment gateway to complete your payment.
                            </p>
                          </div>
                          <Button onClick={handlePayment} disabled={isProcessingPayment} className="w-full" size="lg">
                            {isProcessingPayment ? "Creating Payment..." : "Pay Now"}
                          </Button>
                          <Button onClick={() => setShowPaymentForm(false)} variant="outline" className="w-full">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                {/* Show payment complete status */}
                {(booking.status?.toLowerCase() === "paid" || booking.status?.toLowerCase() === "confirmed") && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">Payment Complete</p>
                    <p className="text-sm text-gray-500 mt-1">Thank you for your booking!</p>
                    
                    {/* Download Receipt Button */}
                    <div className="mt-4">
                      <Button 
                        onClick={handleDownloadReceipt}
                        disabled={isDownloadingReceipt}
                        variant="outline"
                        className="w-full"
                      >
                        {isDownloadingReceipt ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Receipt...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(booking.created_at)}</span>
                </div>
                {booking.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-xs">{booking.payment_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

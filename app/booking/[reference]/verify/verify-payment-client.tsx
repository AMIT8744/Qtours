"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { verifyPaymentClient } from "@/app/actions/dibsy-actions"

interface VerifyPaymentClientProps {
  booking: any
}

type VerificationStatus = "verifying" | "success" | "failed" | "error"

export default function VerifyPaymentClient({ booking }: VerifyPaymentClientProps) {
  const [status, setStatus] = useState<VerificationStatus>("verifying")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const router = useRouter()

  // Automatically start verification when component mounts
  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      setStatus("verifying")
      
      console.log("🔍 Starting payment verification...")
      console.log("📋 Booking Details:", {
        bookingReference: booking.booking_reference,
        paymentId: booking.payment_id,
        customerName: booking.customer_name,
        totalPayment: booking.total_payment,
        status: booking.status
      })
      
      // Call server action to verify payment securely
      console.log("🌐 Calling server action to verify payment...")
      const result = await verifyPaymentClient(booking.payment_id, booking.booking_reference)
      
      console.log("📡 Server action result:", result)
      
      setVerificationResult(result)
      
      if (result.success && result.paymentVerified) {
        console.log("✅ Payment verification successful!")
        setStatus("success")
        // Redirect to booking details after 3 seconds
        setTimeout(() => {
          router.push(`/booking/${booking.booking_reference}`)
        }, 3000)
      } else {
        console.log("❌ Payment verification failed:", result.message || result.error || "Unknown error")
        setStatus("failed")
      }
      
    } catch (error) {
      console.error("💥 Verification error:", error)
      setStatus("error")
      setVerificationResult({ error: error instanceof Error ? error.message : "Verification failed" })
    }
  }



  const handleGoToBooking = () => {
    router.push(`/booking/${booking.booking_reference}`)
  }



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Payment Verification</CardTitle>
          <p className="text-sm text-gray-600">Booking: {booking.booking_reference}</p>
          <p className="text-xs text-gray-500 mt-1">Verification in progress...</p>
        </CardHeader>
        
        <CardContent className="space-y-6">

          {/* Verifying State */}
          {status === "verifying" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verifying Payment...</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Please wait while we verify your payment with our payment provider.
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Payment Verified!</h3>
                <p className="text-sm text-green-700 mt-2">
                  Your payment has been successfully verified. Your booking is now confirmed.
                </p>
              </div>
              
              
              
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Redirecting to booking details...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Payment Verification Failed</h3>
                <p className="text-sm text-red-700 mt-2">
                  We couldn't verify your payment. This might be due to a processing delay.
                </p>
              </div>
              
              {verificationResult && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    <strong>Error:</strong> {verificationResult.message || "Payment verification failed"}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoToBooking}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Verification Error</h3>
                <p className="text-sm text-red-700 mt-2">
                  An error occurred while verifying your payment.
                </p>
              </div>
              
              {verificationResult?.error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    <strong>Error:</strong> {verificationResult.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoToBooking}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Payment Provider Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span>Payment Provided by:</span>
            <img 
              src="https://cdn.prod.website-files.com/62a58c3a72c8e8ca3cbb86f8/648b1b81cedad12e2f246aa9_logo.svg" 
              alt="Dibsy Payment" 
              className="h-6 w-auto"
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 
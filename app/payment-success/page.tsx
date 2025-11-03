"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  useEffect(() => {
    const status = searchParams.get("payment")
    setPaymentStatus(status)
  }, [searchParams])

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Your booking has been confirmed and payment processed successfully.</p>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly with your booking details.
            </p>
            <div className="pt-4 space-y-2">
              <Button onClick={() => router.push("/")} className="w-full bg-blue-600 hover:bg-blue-700">
                Return to Home
              </Button>
              <Link href="/dashboard/bookings" className="block">
                <Button variant="outline" className="w-full">
                  View My Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Processing Payment</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </CardContent>
      </Card>
    </div>
  )
}

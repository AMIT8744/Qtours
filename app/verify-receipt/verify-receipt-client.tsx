"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { verifyReceipt } from "@/app/actions/verify-receipt-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Ship, Users, Euro, CheckCircle, Search, Loader2, MapPin } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"

export default function VerifyReceiptClient() {
  const searchParams = useSearchParams()
  const [reference, setReference] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAutoVerifying, setIsAutoVerifying] = useState(false)

  // Check if a reference is provided in the URL
  const refFromUrl = searchParams.get("ref")
  const hasReferenceInUrl = !!refFromUrl

  useEffect(() => {
    if (refFromUrl && refFromUrl.trim() !== "") {
      const cleanRef = refFromUrl.trim().toUpperCase()
      setReference(cleanRef)
      setIsAutoVerifying(true)
      handleVerify(cleanRef)
    }
  }, [refFromUrl])

  const handleVerify = async (ref: string = reference) => {
    const cleanRef = ref.trim().toUpperCase()

    if (!cleanRef || cleanRef === "") {
      setError("Please enter a booking reference")
      return
    }

    setIsVerifying(true)
    setError(null)
    setVerificationResult(null)

    try {
      console.log("Verifying reference:", cleanRef)
      const result = await verifyReceipt(cleanRef)
      setVerificationResult(result)
      if (!result.valid) {
        setError(result.message)
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("Unable to verify receipt. Please check your connection and try again.")
    } finally {
      setIsVerifying(false)
      setIsAutoVerifying(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://escursionincrociera.com/wp-content/uploads/2024/05/Untitled-design.png"
              alt="Viaggi Del Qatar Logo"
              width={120}
              height={120}
              className="bg-white p-2 shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Receipt Verification</h1>
          <p className="text-gray-500 mt-2">Verify the authenticity of your booking receipt</p>
        </div>

        {/* Only show the verification form if no reference is provided in the URL */}
        {!hasReferenceInUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Receipt</CardTitle>
              <CardDescription>Enter the booking reference to verify your receipt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="reference" className="sr-only">
                    Booking Reference
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter booking reference (e.g., VDQ123456)"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    className="uppercase"
                  />
                </div>
                <Button onClick={() => handleVerify()} disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show loading state when auto-verifying */}
        {isAutoVerifying && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6b0f1a]" />
                <p className="mt-4 text-muted-foreground">Verifying receipt...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show error message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Show verification result */}
        {verificationResult && verificationResult.valid && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Valid Receipt</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>
              <CardDescription>This receipt is authentic and valid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-[#6b0f1a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="font-medium">{verificationResult.booking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-[#6b0f1a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Passengers</p>
                    <p className="font-medium">{verificationResult.booking.totalPassengers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Euro className="h-5 w-5 text-[#6b0f1a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payment</p>
                    <p className="font-medium">€{Number(verificationResult.booking.totalPayment).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Tour Details */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Tour Details</h3>
                <div className="space-y-4">
                  {verificationResult.booking.tours.map((tour: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <div className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-lg">{tour.tourName}</div>
                              <Badge variant="outline" className="bg-[#6b0f1a] text-white hover:bg-[#6b0f1a]">
                                €{Number(tour.price).toFixed(2)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Ship className="h-4 w-4 text-[#6b0f1a]" />
                                <span>{tour.shipName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4 text-[#6b0f1a]" />
                                <span>{formatDate(tour.tourDate)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-[#6b0f1a]" />
                                <span>{tour.passengers} passengers</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-[#6b0f1a]" />
                                <span>{tour.location}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Booking Reference</p>
                    <p className="font-medium">{verificationResult.booking.reference}</p>
                  </div>
                  <Badge
                    variant={
                      verificationResult.booking.status === "confirmed"
                        ? "outline"
                        : verificationResult.booking.status === "paid"
                          ? "default"
                          : "secondary"
                    }
                    className={
                      verificationResult.booking.status === "confirmed"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : verificationResult.booking.status === "paid"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    }
                  >
                    {verificationResult.booking.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-xs text-muted-foreground">
                This receipt was verified on {format(new Date(), "PPP 'at' pp")}
              </p>
            </CardFooter>
          </Card>
        )}

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>© 2025 Viaggi Del Qatar. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/" className="text-[#6b0f1a] hover:underline">
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

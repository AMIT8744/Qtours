"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Users, Euro, CreditCard, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { parseISO } from "date-fns"

interface Supplement {
  name: string
  price: number
  childrenPrice?: number
  description?: string
}

interface BookingData {
  tourId: string
  tourName: string
  date: string
  adults: number
  children: number
  totalPax: number
  totalPrice: number
  pricePerPerson: number
  supplements?: Supplement[]
  isPackage?: boolean
  packageId?: string
  packageName?: string
  adultPrice?: number
  childPrice?: number
}

interface CheckoutClientProps {
  dibsyPublicKey: string
}

declare global {
  interface Window {
    Dibsy: any
  }
}

// Conversion rate: 1 EUR = 4.20 QAR
const EUR_TO_QAR_RATE = 4.2

export default function CheckoutClient({ dibsyPublicKey }: CheckoutClientProps) {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dibsyLoaded, setDibsyLoaded] = useState(false)
  const [dibsyInstance, setDibsyInstance] = useState<any>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const dibsyRef = useRef<any>(null)

  const [bookingCreated, setBookingCreated] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showAdditionalRequest, setShowAdditionalRequest] = useState(false)
  const [verificationResponse, setVerificationResponse] = useState<any>(null)

  // Calculate QAR amount
  const qarAmount = bookingData ? Number.parseFloat((bookingData.totalPrice * EUR_TO_QAR_RATE).toFixed(2)) : 0
  const qarPricePerPerson = bookingData
    ? Number.parseFloat((bookingData.pricePerPerson * EUR_TO_QAR_RATE).toFixed(2))
    : 0

  useEffect(() => {
    const data = sessionStorage.getItem("bookingData")
    if (data) {
      const parsedData = JSON.parse(data)
      setBookingData(parsedData)
      
      // If there are supplements, format them and set in specialRequests
      if (parsedData.supplements && parsedData.supplements.length > 0) {
        const supplementsText = parsedData.supplements.map((supplement: Supplement) => {
          const adultPrice = supplement.price * parsedData.adults
          const childrenPrice = (supplement.childrenPrice || supplement.price) * parsedData.children
          const totalSupplementPrice = adultPrice + childrenPrice
          return `${supplement.name}: €${totalSupplementPrice} (Adults: €${supplement.price}, Children: €${supplement.childrenPrice || supplement.price})`
        }).join('\n')
        
        setCustomerInfo(prev => ({
          ...prev,
          specialRequests: `TOUR SUPPLEMENT:\n${supplementsText}`
        }))
      }
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    // Load Dibsy.JS script
    const script = document.createElement("script")
    script.src = "https://cdn.dibsy.one/js/dibsy-2.0.0.js"
    script.async = true
    script.onload = initializeDibsy
    script.onerror = () => {
      console.error("Failed to load Dibsy script")
      setPaymentError("Failed to load payment system. Please refresh the page.")
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const initializeDibsy = async () => {
    try {
      if (window.Dibsy) {
        console.log("Initializing Dibsy with key:", dibsyPublicKey)

        const dibsy = await window.Dibsy(dibsyPublicKey, {
          locale: "en_US",
        })

        dibsyRef.current = dibsy
        setDibsyInstance(dibsy)

        // Create and mount payment components
        const options = {
          styles: {
            base: {
              color: "rgba(0, 0, 0, 0.8)",
              fontSize: 16,
              fontWeight: "400",
            },
            valid: {
              color: "#059669",
            },
            invalid: {
              color: "#dc2626",
            },
          },
        }

        // Create components
        const cardHolder = dibsy.createComponent("cardHolder", options)
        const cardNumber = dibsy.createComponent("cardNumber", options)
        const expiryDate = dibsy.createComponent("expiryDate", options)
        const verificationCode = dibsy.createComponent("verificationCode", options)

        // Mount components
        cardHolder.mount("#card-holder")
        cardNumber.mount("#card-number")
        expiryDate.mount("#expiry-date")
        verificationCode.mount("#verification-code")

        // Add error handling
        const cardHolderError = document.getElementById("card-holder-error")
        const cardNumberError = document.getElementById("card-number-error")
        const expiryDateError = document.getElementById("expiry-date-error")
        const verificationCodeError = document.getElementById("verification-code-error")

        cardHolder.addEventListener("change", (event: any) => {
          if (cardHolderError) {
            cardHolderError.textContent = event.error && event.touched ? event.error : ""
          }
        })

        cardNumber.addEventListener("change", (event: any) => {
          if (cardNumberError) {
            cardNumberError.textContent = event.error && event.touched ? event.error : ""
          }
        })

        expiryDate.addEventListener("change", (event: any) => {
          if (expiryDateError) {
            expiryDateError.textContent = event.error && event.touched ? event.error : ""
          }
        })

        verificationCode.addEventListener("change", (event: any) => {
          if (verificationCodeError) {
            verificationCodeError.textContent = event.error && event.touched ? event.error : ""
          }
        })

        setDibsyLoaded(true)
        console.log("Dibsy initialized successfully")
      }
    } catch (error) {
      console.error("Failed to initialize Dibsy:", error)
      setPaymentError("Failed to load payment system. Please refresh the page.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingData) return

    // Validate customer info
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      setPaymentError("Please fill in all required customer information fields.")
      return
    }

    setIsLoading(true)
    setPaymentError(null)

    try {
      // Create booking first with pending status
      const bookingResponse = await fetch("/api/bookings/create-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerInfo: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
          bookingData: {
            ...bookingData,
            notes: customerInfo.specialRequests,
            payment_status: "pending",
          },
        }),
      })

      const bookingResult = await bookingResponse.json()

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.message || "Failed to create booking")
      }

      setBookingCreated(true)
      setBookingReference(bookingResult.booking_reference)

      // Store booking info for payment
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          bookingId: bookingResult.bookingId,
          bookingReference: bookingResult.booking_reference,
          customerInfo,
          bookingData,
        }),
      )

      // Redirect to booking page
      router.push(`/booking/${bookingResult.booking_reference}`)
    } catch (error) {
      console.error("Booking creation error:", error)
      setPaymentError(error instanceof Error ? error.message : "Failed to create booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingData || !dibsyInstance || !bookingReference) return

    setIsLoading(true)
    setPaymentError(null)

    try {
      console.log("Getting card token from Dibsy...")

      // Get card token from Dibsy
      const { token, error } = await dibsyInstance.cardToken()

      if (error) {
        console.error("Dibsy card token error:", error)
        throw new Error(error.message || "Failed to process payment information")
      }

      if (!token) {
        throw new Error("Failed to generate payment token")
      }

      console.log("Card token received, submitting payment...")

      // Submit payment to our backend with booking reference
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardToken: token,
          amount: Number(bookingData.totalPrice),
          currency: "EUR",
          customerInfo,
          bookingData,
          bookingReference, // Include booking reference
          metadata: {
            bookingReference: bookingReference, // Add this to metadata for webhook
            customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            customerEmail: customerInfo.email,
            tourId: bookingData.tourId,
            tourDate: bookingData.date,
            passengers: bookingData.totalPax,
            originalEurAmount: bookingData.totalPrice,
          },
        }),
      })

      const result = await response.json()
      console.log("Payment API response:", result)

      if (!response.ok) {
        console.error("Payment API error:", result)
        throw new Error(result.error || `Payment failed (${response.status})`)
      }

      if (result.requiresAuthentication && result.redirectUrl) {
        console.log("Redirecting to 3D Secure:", result.redirectUrl)
        window.location.href = result.redirectUrl
      } else if (result.success) {
        console.log("Payment successful:", result)
        setPaymentSuccess(true)

        // Verify payment with Dibsy and update booking status
        try {
          const verificationResponse = await fetch(`/api/payments/verify-dibsy?paymentId=${result.paymentId}&bookingReference=${bookingReference}`)
          const verificationResult = await verificationResponse.json()
          
          // Store verification response for debug display
          setVerificationResponse(verificationResult)
          
          if (verificationResult.success) {
            console.log("Payment verified successfully:", verificationResult)
          } else {
            console.warn("Payment verification failed:", verificationResult)
            // Still proceed since the payment was successful
          }
        } catch (verificationError) {
          console.error("Payment verification error:", verificationError)
          setVerificationResponse({ error: verificationError instanceof Error ? verificationError.message : "Verification failed" })
          // Still proceed since the payment was successful
        }

        sessionStorage.removeItem("bookingData")
        sessionStorage.removeItem("pendingBooking")

        setTimeout(() => {
          router.push(`/booking/${bookingReference}/verify`)
        }, 2000)
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your booking details.</p>
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
            Back to Tours
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        {/* Currency Information Alert */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Payment Currency:</strong> Prices are displayed in EUR, but you will be charged in QAR (Qatari
            Riyal) at the rate of 1 EUR = 4.20 QAR. Your total charge will be <strong>{qarAmount} QAR</strong>.
          </AlertDescription>
        </Alert>

        {/* Payment error alert hidden */}

        {paymentSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Redirecting to confirmation page...
            </AlertDescription>
          </Alert>
        )}

        {/* Debug: Dibsy Verification Response */}
        {verificationResponse && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 text-lg">🔧 Debug: Dibsy Payment Verification Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded border border-orange-200">
                <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(verificationResponse, null, 2)}
                </pre>
              </div>
              <div className="mt-3 text-sm text-orange-700">
                <strong>Status:</strong> {verificationResponse.success ? "✅ Success" : "❌ Failed"}
                {verificationResponse.paymentData && (
                  <>
                    <br />
                    <strong>Payment ID:</strong> {verificationResponse.paymentData.id}
                    <br />
                    <strong>Amount:</strong> {verificationResponse.paymentData.amount?.value} {verificationResponse.paymentData.amount?.currency}
                    <br />
                    <strong>Method:</strong> {verificationResponse.paymentData.method}
                  </>
                )}
                {verificationResponse.booking && (
                  <>
                    <br />
                    <strong>Booking Reference:</strong> {verificationResponse.booking.bookingReference}
                    <br />
                    <strong>Customer:</strong> {verificationResponse.booking.customerName}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information and Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="specialRequests">Additional Request</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdditionalRequest(!showAdditionalRequest)}
                        className="text-xs"
                      >
                        {showAdditionalRequest ? "Hide" : "Add Request"}
                      </Button>
                    </div>
                    {showAdditionalRequest && (
                      <textarea
                        id="specialRequests"
                        rows={4}
                        value={customerInfo.specialRequests}
                        onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional requests or special requirements..."
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <p className="text-sm text-gray-600"></p>
              </CardHeader>
              <CardContent>
                {!bookingCreated ? (
                  // Booking Creation Form
                  <form onSubmit={handleBooking} className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Booking..." : "Create Booking"}
                    </Button>
                  </form>
                ) : showPaymentForm ? (
                  // Payment Form (existing payment form code)
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <Label htmlFor="card-holder">Cardholder Name *</Label>
                      <div id="card-holder" className="mt-1"></div>
                      <div id="card-holder-error" className="text-red-600 text-sm mt-1"></div>
                    </div>

                    <div>
                      <Label htmlFor="card-number">Card Number *</Label>
                      <div id="card-number" className="mt-1"></div>
                      <div id="card-number-error" className="text-red-600 text-sm mt-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry-date">Expiry Date *</Label>
                        <div id="expiry-date" className="mt-1"></div>
                        <div id="expiry-date-error" className="text-red-600 text-sm mt-1"></div>
                      </div>
                      <div>
                        <Label htmlFor="verification-code">CVC *</Label>
                        <div id="verification-code" className="mt-1"></div>
                        <div id="verification-code-error" className="text-red-600 text-sm mt-1"></div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={isLoading || !dibsyLoaded || paymentSuccess}
                    >
                      {isLoading
                        ? "Processing Payment..."
                        : !dibsyLoaded
                          ? "Loading Payment System..."
                          : `Pay ${qarAmount} QAR`}
                    </Button>
                  </form>
                ) : (
                  // Show payment button
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Booking created successfully! Reference: <strong>{bookingReference}</strong>
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={!dibsyLoaded}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{bookingData.tourName}</h3>
                  {bookingData.isPackage && (
                    <p className="text-sm text-gray-600 mt-1">
                      Package booking - tour dates will be coordinated after payment
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {bookingData.isPackage ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Dates to be determined after booking</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{format(parseISO(bookingData.date), "EEEE, MMMM d, yyyy")}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {bookingData.adults} Adult{bookingData.adults > 1 ? "s" : ""}
                      {bookingData.children > 0 &&
                        `, ${bookingData.children} Child${bookingData.children > 1 ? "ren" : ""}`}
                    </span>
                  </div>
                </div>

                {/* Supplements Section */}
                {bookingData.supplements && bookingData.supplements.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Supplements</h4>
                      {bookingData.supplements.map((supplement, index) => {
                        const adultPrice = supplement.price * bookingData.adults
                        const childrenPrice = (supplement.childrenPrice || supplement.price) * bookingData.children
                        const totalSupplementPrice = adultPrice + childrenPrice
                        
                        return (
                          <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                <span className="text-sm font-medium text-amber-800">{supplement.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-amber-800">€{totalSupplementPrice}</span>
                            </div>
                            {supplement.description && (
                              <p className="text-xs text-amber-700 mt-1">{supplement.description}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      €{bookingData.pricePerPerson} × {bookingData.totalPax} passengers
                    </span>
                    <span>€{bookingData.totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {qarPricePerPerson} QAR × {bookingData.totalPax} passengers
                    </span>
                    <span>{qarAmount} QAR</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total (EUR)</span>
                    <div className="flex items-center">
                      <Euro className="h-5 w-5 mr-1" />
                      <span>{bookingData.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-semibold text-lg text-blue-600">
                    <span>You'll be charged</span>
                    <div className="flex items-center">
                      <span className="mr-1">QAR</span>
                      <span>{qarAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-4 space-y-1">
                  <p>🔒 Your payment is secured by Dibsy</p>
                  <p>💳 We accept all major credit cards</p>
                  <p>💱 Rate: 1 EUR = 4.20 QAR</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dibsy-component {
          background: #fff;
          box-shadow: 0px 1px 0px rgb(0 0 0 / 10%), 0px 2px 4px rgb(0 0 0 / 10%),
            0px 4px 8px rgb(0 0 0 / 5%);
          border-radius: 6px;
          padding: 12px;
          border: 1px solid #d1d5db;
          transition: 0.15s border-color cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 400;
          min-height: 44px;
        }

        .dibsy-component.is-touched {
          border-color: #3b82f6;
          transition: 0.3s border-color cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dibsy-component.has-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
          transition: 0.3s border-color cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dibsy-component.is-invalid {
          border-color: #ef4444;
          transition: 0.3s border-color cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dibsy-component.is-valid {
          border-color: #10b981;
          transition: 0.3s border-color cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

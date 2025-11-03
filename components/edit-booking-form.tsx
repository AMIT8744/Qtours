"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  CreditCard,
  Ship,
  Users,
  Mail,
  Phone,
  FileText,
  Euro,
  CheckCircle,
  Trash2,
  PlusCircle,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { updateBooking } from "@/app/actions/booking-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Tour {
  id: string
  name: string
  ship_name: string
  location: string
  price: number
}

interface ShipType {
  id: string
  name: string
}

interface BookingAgent {
  id: string
  name: string
}

interface TourBooking {
  id: string
  tour_id: string
  tour_name: string
  ship_name: string
  tour_date: Date | undefined
  adults: number
  children: number
  total_pax: number
  price: number
  adultPrice: number // NEW: Adult price per person
  childrenPrice: number // NEW: Children price per person
  deposit: number
  remaining_balance: number
  booking_agent_id: string
  ship_id: string
  tour_guide: string
  // For display purposes
  bookingAgentName?: string
  shipName_display?: string
}

interface BookingData {
  id: string
  booking_reference: string
  customer_name: string
  email: string
  phone: string
  notes: string
  payment_status: string
  payment_location: string
  other: string
  tours: TourBooking[]
  commission: number
}

interface EditBookingFormProps {
  booking: BookingData
  tours: Tour[]
  ships: ShipType[]
  bookingAgents: BookingAgent[]
}

// Helper function to safely format date for input
const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return ""

  try {
    if (typeof date === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
      }
      if (date.includes("T")) {
        return date.split("T")[0]
      }
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0]
      }
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }

    return ""
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

// Helper function to parse date from string
const parseDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

export default function EditBookingForm({ booking, tours = [], ships = [], bookingAgents = [] }: EditBookingFormProps) {
  const [activeTab, setActiveTab] = useState("customer-info")
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [activeTourIndex, setActiveTourIndex] = useState(0)
  const [paymentLocation, setPaymentLocation] = useState("")
  const [other, setOther] = useState("")
  const [commission, setCommission] = useState(0)

  const router = useRouter()

  // Initialize form data from booking
  useEffect(() => {
    if (booking) {
      console.log("Initializing form with booking data:", booking)

      setCustomerName(booking.customer_name || "")
      setCustomerEmail(booking.email || "")
      setCustomerPhone(booking.phone || "")
      setNotes(booking.notes || "")
      setPaymentStatus(booking.status || booking.payment_status || "pending")
      setPaymentLocation(booking.payment_location || "")
      setOther(booking.other || "")
      setCommission(Number(booking.commission) || 0)

      // Initialize tour bookings with proper data mapping
      if (booking.tours && booking.tours.length > 0) {
        console.log("Initializing tours:", booking.tours)

        const initialTourBookings = booking.tours.map((tour, index) => {
          console.log(`Processing tour ${index + 1}:`, tour)

          return {
            id: tour.id || `tour-${index}`,
            tour_id: tour.tour_id || "",
            tour_name: tour.tour_name || "Select a tour",
            ship_name: tour.ship_name || "",
            tour_date: parseDate(tour.tour_date as any),
            adults: Number(tour.adults) || 0,
            children: Number(tour.children) || 0,
            total_pax: Number(tour.total_pax) || 0,
            price: Number(tour.price) || 0,
            adultPrice: Number(tour.adult_price) || 0, // ✅ Fixed mapping
            childrenPrice: Number(tour.children_price) || 0, // ✅ Fixed mapping
            deposit: Number(tour.deposit) || 0,
            remaining_balance: Number(tour.remaining_balance) || 0,
            booking_agent_id: tour.booking_agent_id || "", // ✅ Fixed mapping
            ship_id: tour.ship_id || "", // ✅ Fixed mapping
            tour_guide: tour.tour_guide || "",
            bookingAgentName: tour.bookingAgentName || tour.booking_agent_name || "", // ✅ Fixed mapping
            shipName_display: tour.shipName_display || tour.ship_name_display || tour.ship_name || "", // ✅ Fixed mapping
          }
        })

        console.log("Initialized tour bookings with all fields:", initialTourBookings)
        setTourBookings(initialTourBookings)
      } else {
        // Create a default tour booking if none exist
        console.log("No tours found, creating default tour booking")
        setTourBookings([
          {
            id: "tour-" + Date.now(),
            tour_id: "",
            tour_name: "Select a tour",
            ship_name: "",
            tour_date: undefined,
            adults: 0,
            children: 0,
            total_pax: 0,
            price: 0,
            adultPrice: 0,
            childrenPrice: 0,
            deposit: 0,
            remaining_balance: 0,
            booking_agent_id: "",
            ship_id: "",
            tour_guide: "",
            bookingAgentName: "",
            shipName_display: "",
          },
        ])
      }
    }
  }, [booking])

  // Calculate total across all tours
  const totalAmount = tourBookings.reduce((sum, booking) => sum + booking.price, 0)
  const totalDeposit = tourBookings.reduce((sum, booking) => sum + booking.deposit, 0)
  const totalRemaining = tourBookings.reduce((sum, booking) => sum + booking.remaining_balance, 0)

  // Add a new tour booking
  const addTourBooking = () => {
    setTourBookings([
      ...tourBookings,
      {
        id: "tour-" + Date.now() + "-" + tourBookings.length,
        tour_id: "",
        tour_name: "Select a tour",
        ship_name: "",
        tour_date: undefined,
        adults: 0,
        children: 0,
        total_pax: 0,
        price: 0,
        adultPrice: 0,
        childrenPrice: 0,
        deposit: 0,
        remaining_balance: 0,
        booking_agent_id: "",
        ship_id: "",
        tour_guide: "",
        bookingAgentName: "",
        shipName_display: "",
      },
    ])
    setActiveTourIndex(tourBookings.length)
  }

  // Remove a tour booking
  const removeTourBooking = (index: number) => {
    if (tourBookings.length <= 1) {
      setError("You must have at least one tour booking")
      return
    }

    const newTourBookings = [...tourBookings]
    newTourBookings.splice(index, 1)
    setTourBookings(newTourBookings)

    if (activeTourIndex >= newTourBookings.length) {
      setActiveTourIndex(newTourBookings.length - 1)
    }
  }

  // Update a specific tour booking
  const updateTourBooking = (index: number, updates: Partial<TourBooking>) => {
    const newTourBookings = [...tourBookings]
    newTourBookings[index] = { ...newTourBookings[index], ...updates }
    setTourBookings(newTourBookings)
  }

  // Calculate tour price based on adult and children prices with fallback
  const calculateTourPrice = useCallback(
    (index: number, adultPrice: number, childrenPrice: number, adults: number, children: number) => {
      let totalPrice = 0

      // If both adult and children prices are 0, try to fallback to original tour price
      if (adultPrice === 0 && childrenPrice === 0) {
        const currentBooking = getCurrentTourBooking()
        if (currentBooking?.tour_id) {
          const tour = tours.find((t) => t.id === currentBooking.tour_id)
          if (tour) {
            totalPrice = Math.round(Number.parseFloat(tour.price.toString()))
          }
        }
      } else {
        // Calculate based on individual prices
        totalPrice = adultPrice * adults + childrenPrice * children
      }

      const currentBooking = getCurrentTourBooking()
      const currentDeposit = currentBooking?.deposit || 0
      const remaining = totalPrice - currentDeposit

      updateTourBooking(index, {
        adultPrice: Math.round(adultPrice),
        childrenPrice: Math.round(childrenPrice),
        price: Math.round(totalPrice),
        remaining_balance: Math.round(remaining),
      })
    },
    [tourBookings, tours],
  )

  // Calculate total passengers for a specific tour
  const calculateTotalPax = (index: number, adults: number, children: number) => {
    const totalPax = adults + children
    const currentBooking = getCurrentTourBooking()
    const adultPrice = currentBooking?.adultPrice || 0
    const childrenPrice = currentBooking?.childrenPrice || 0

    updateTourBooking(index, { adults, children, total_pax: totalPax })

    // Recalculate tour price based on new passenger counts
    calculateTourPrice(index, adultPrice, childrenPrice, adults, children)
  }

  // Calculate remaining balance for a specific tour
  const calculateRemaining = (index: number, price: number, deposit: number) => {
    const remaining = price - deposit
    updateTourBooking(index, {
      price: Math.round(price),
      deposit: Math.round(deposit),
      remaining_balance: Math.round(remaining),
    })
  }

  // Handle tour selection
  const handleTourChange = (index: number, tourId: string) => {
    if (tourId && tourId !== "no-tour-selected") {
      const tour = tours.find((t) => t.id === tourId)
      if (tour) {
        const price = Math.round(Number.parseFloat(tour.price.toString()))
        const currentBooking = tourBookings[index]

        // Preserve existing deposit if it exists, otherwise calculate 30%
        const existingDeposit = currentBooking?.deposit || 0
        const deposit = existingDeposit > 0 ? existingDeposit : Math.round(price * 0.3)

        const shipId = ships.find((s) => s.name === tour.ship_name)?.id || ""

        updateTourBooking(index, {
          tour_id: tourId,
          tour_name: `${tour.name} - ${tour.ship_name}`,
          ship_name: tour.ship_name,
          price,
          deposit,
          remaining_balance: price - deposit,
          ship_id: shipId,
        })
      }
    }
  }

  // Handle booking agent selection
  const handleBookingAgentChange = (index: number, agentId: string) => {
    console.log(`Changing booking agent for tour ${index} to agent ID: ${agentId}`)

    if (agentId === "no-agent-selected" || !agentId) {
      updateTourBooking(index, {
        booking_agent_id: "",
        bookingAgentName: "",
        tour_guide: "",
      })
      return
    }

    const agent = agentsToUse.find((a) => a.id === agentId)
    console.log(`Found agent:`, agent)

    updateTourBooking(index, {
      booking_agent_id: agentId,
      bookingAgentName: agent?.name || "",
      tour_guide: agent?.name || "",
    })
  }

  // Handle ship selection
  const handleShipChange = (index: number, shipId: string) => {
    console.log(`Changing ship for tour ${index} to ship ID: ${shipId}`)

    if (shipId === "no-ship-selected" || !shipId) {
      updateTourBooking(index, {
        ship_id: "",
        shipName_display: "",
      })
      return
    }

    const ship = ships.find((s) => s.id === shipId)
    console.log(`Found ship:`, ship)

    if (ship) {
      updateTourBooking(index, {
        ship_id: shipId,
        shipName_display: ship.name || "",
      })
    }
  }

  const agentsToUse = bookingAgents || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate data
      if (!customerName || customerName.trim() === "") {
        throw new Error("Customer name is required")
      }

      if (!customerEmail || customerEmail.trim() === "") {
        throw new Error("Customer email is required")
      }

      if (tourBookings.length === 0) {
        throw new Error("At least one tour booking is required")
      }

      // Validate that at least one tour has required data
      const validTours = tourBookings.filter((tour) => tour.tour_id && tour.tour_id !== "" && tour.tour_date)

      if (validTours.length === 0) {
        throw new Error("At least one tour must have a selected tour and date")
      }

      // Prepare booking data for update
      const updatedBooking = {
        id: booking.id,
        customer_name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        notes: notes,
        payment_status: paymentStatus,
        payment_location: paymentLocation,
        other_information: other,
        commission: commission, // Add this line
        tours: validTours.map((tour) => ({
          id: tour.id,
          tour_id: tour.tour_id,
          tour_date: tour.tour_date ? format(tour.tour_date, "yyyy-MM-dd") : null,
          adults: Number(tour.adults) || 0,
          children: Number(tour.children) || 0,
          total_pax: Number(tour.total_pax) || 0,
          price: Number(tour.price) || 0,
          adult_price: Number(tour.adultPrice) || 0, // NEW: Include adult price
          children_price: Number(tour.childrenPrice) || 0, // NEW: Include children price
          deposit: Number(tour.deposit) || 0,
          remaining_balance: Number(tour.remaining_balance) || 0,
          booking_agent_id: tour.booking_agent_id || null,
          ship_id: tour.ship_id || null,
          tour_guide: tour.tour_guide || "",
          notes: tour.notes || "",
        })),
      }

      console.log("Submitting booking update:", updatedBooking)

      const result = await updateBooking(updatedBooking)

      if (result && result.success) {
        setSuccess("Booking updated successfully!")
        setTimeout(() => {
          router.push("/dashboard/bookings")
          router.refresh()
        }, 2000)
      } else {
        setError(result?.message || "Failed to update booking. Please check the form.")
      }
    } catch (e) {
      setError((e as Error).message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current tour booking safely
  const getCurrentTourBooking = (): TourBooking | null => {
    if (!tourBookings || tourBookings.length === 0 || activeTourIndex < 0 || activeTourIndex >= tourBookings.length) {
      return null
    }
    return tourBookings[activeTourIndex]
  }

  const currentTour = getCurrentTourBooking()

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200 shadow-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-semibold text-lg">✅ {success}</div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger
              value="customer-info"
              className="flex items-center gap-2 text-gray-600 bg-white data-[state=active]:bg-[#6b0f1a] data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              <span>Customer Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="tour-bookings"
              className="flex items-center gap-2 text-gray-600 bg-white data-[state=active]:bg-[#6b0f1a] data-[state=active]:text-white"
            >
              <Ship className="h-4 w-4" />
              <span>Tour Bookings</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment-info"
              className="flex items-center gap-2 text-gray-600 bg-white data-[state=active]:bg-[#6b0f1a] data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payment Info</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#6b0f1a]" />
                  Customer Information
                </CardTitle>
                <CardDescription>Update the customer's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#6b0f1a]" />
                    Customer Name
                  </Label>
                  <Input
                    id="customer_name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#6b0f1a]" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#6b0f1a]" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+974 xxxx xxxx"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/dashboard/bookings">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="button" onClick={() => setActiveTab("tour-bookings")}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tour-bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-[#6b0f1a]" />
                      Tour Bookings
                    </CardTitle>
                    <CardDescription>Edit tours for this customer</CardDescription>
                  </div>
                  <Button type="button" onClick={addTourBooking} variant="outline" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Another Tour
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tour booking tabs */}
                <div className="border rounded-md p-1">
                  <div className="flex overflow-x-auto pb-2">
                    {tourBookings.map((booking, index) => (
                      <button
                        key={booking.id}
                        type="button"
                        className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center gap-2 ${
                          activeTourIndex === index ? "bg-[#6b0f1a] text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() => setActiveTourIndex(index)}
                      >
                        <Ship className="h-4 w-4" />
                        <span>Tour {index + 1}</span>
                        {tourBookings.length > 1 && (
                          <button
                            type="button"
                            className={`ml-2 rounded-full p-1 ${
                              activeTourIndex === index ? "hover:bg-[#8a1325]" : "hover:bg-gray-300"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              removeTourBooking(index)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active tour booking form */}
                {currentTour && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`tour-date-${activeTourIndex}`} className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-[#6b0f1a]" />
                          Tour Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              id={`tour-date-${activeTourIndex}`}
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {currentTour.tour_date ? format(currentTour.tour_date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={currentTour.tour_date}
                              onSelect={(date) => updateTourBooking(activeTourIndex, { tour_date: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`tour-id-${activeTourIndex}`} className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-[#6b0f1a]" />
                          Tour
                        </Label>
                        <Select
                          value={currentTour.tour_id || ""}
                          onValueChange={(value) => handleTourChange(activeTourIndex, value)}
                        >
                          <SelectTrigger id={`tour-id-${activeTourIndex}`}>
                            <SelectValue placeholder="Select a tour" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="no-tour-selected">Select a tour</SelectItem>
                            {tours &&
                              tours.map((tour) => (
                                <SelectItem key={tour.id} value={tour.id}>
                                  {tour.name} - {tour.ship_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`adults-${activeTourIndex}`} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#6b0f1a]" />
                          Number of Adults
                        </Label>
                        <Input
                          id={`adults-${activeTourIndex}`}
                          type="number"
                          min="0"
                          value={currentTour.adults}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            calculateTotalPax(activeTourIndex, value, currentTour.children)
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`children-${activeTourIndex}`} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#6b0f1a]" />
                          Number of Children
                        </Label>
                        <Input
                          id={`children-${activeTourIndex}`}
                          type="number"
                          min="0"
                          value={currentTour.children}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            calculateTotalPax(activeTourIndex, currentTour.adults, value)
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`total-pax-${activeTourIndex}`} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#6b0f1a]" />
                          Total Passengers
                        </Label>
                        <Input
                          id={`total-pax-${activeTourIndex}`}
                          type="number"
                          min="0"
                          value={currentTour.total_pax}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`price-${activeTourIndex}`} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-[#6b0f1a]" />
                          Tour Price (Total)
                        </Label>
                        <Input
                          id={`price-${activeTourIndex}`}
                          placeholder="0"
                          type="number"
                          min="0"
                          readOnly
                          value={currentTour?.price === 0 ? "" : Math.round(currentTour?.price || 0)}
                          className="bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 Calculated as (Adults × Adult Price) + (Children × Children Price)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`adult-price-${activeTourIndex}`} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-[#6b0f1a]" />
                          Adult Price (€)
                        </Label>
                        <Input
                          id={`adult-price-${activeTourIndex}`}
                          placeholder="0"
                          type="number"
                          min="0"
                          value={currentTour?.adultPrice === 0 ? "" : Math.round(currentTour?.adultPrice || 0)}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            calculateTourPrice(
                              activeTourIndex,
                              value,
                              currentTour?.childrenPrice || 0,
                              currentTour?.adults || 0,
                              currentTour?.children || 0,
                            )
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`children-price-${activeTourIndex}`} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-[#6b0f1a]" />
                          Children Price (€)
                        </Label>
                        <Input
                          id={`children-price-${activeTourIndex}`}
                          placeholder="0"
                          type="number"
                          min="0"
                          value={currentTour?.childrenPrice === 0 ? "" : Math.round(currentTour?.childrenPrice || 0)}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            calculateTourPrice(
                              activeTourIndex,
                              currentTour?.adultPrice || 0,
                              value,
                              currentTour?.adults || 0,
                              currentTour?.children || 0,
                            )
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`deposit-${activeTourIndex}`} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-[#6b0f1a]" />
                          Deposit Amount
                        </Label>
                        <Input
                          id={`deposit-${activeTourIndex}`}
                          placeholder="0"
                          type="number"
                          min="0"
                          value={currentTour?.deposit === 0 ? "" : Math.round(currentTour?.deposit || 0)}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            calculateRemaining(activeTourIndex, currentTour?.price || 0, value)
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`remaining-${activeTourIndex}`} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-[#6b0f1a]" />
                          Remaining Balance
                        </Label>
                        <Input
                          id={`remaining-${activeTourIndex}`}
                          placeholder="0"
                          value={
                            currentTour?.remaining_balance === 0 ? "" : Math.round(currentTour?.remaining_balance || 0)
                          }
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">💡 Calculated as Tour Price - Deposit</p>
                      </div>
                    </div>

                    {/* Updated fields for Booking Agent and Ship */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`booking-agent-${activeTourIndex}`} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#6b0f1a]" />
                          Name of Booking Agent
                        </Label>
                        <Select
                          value={currentTour.booking_agent_id || ""}
                          onValueChange={(value) => handleBookingAgentChange(activeTourIndex, value)}
                        >
                          <SelectTrigger id={`booking-agent-${activeTourIndex}`}>
                            <SelectValue placeholder="Select booking agent" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="no-agent-selected">Select booking agent</SelectItem>
                            {agentsToUse.length > 0 ? (
                              agentsToUse.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-agents" disabled>
                                No booking agents available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {agentsToUse.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No booking agents found. Please add agents in the Agents Management section.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ship-${activeTourIndex}`} className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-[#6b0f1a]" />
                          Name of Ships
                        </Label>
                        <Select
                          value={currentTour.ship_id || ""}
                          onValueChange={(value) => handleShipChange(activeTourIndex, value)}
                        >
                          <SelectTrigger id={`ship-${activeTourIndex}`}>
                            <SelectValue placeholder="Select ship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-ship-selected">Select ship</SelectItem>
                            {ships && ships.length > 0 ? (
                              ships.map((ship) => (
                                <SelectItem key={ship.id} value={ship.id}>
                                  {ship.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-ships" disabled>
                                No ships available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("customer-info")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("payment-info")}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payment-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#6b0f1a]" />
                  Payment Information
                </CardTitle>
                <CardDescription>Review and update payment details for all tours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tour summary */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Tour Summary</h3>
                  <div className="space-y-3">
                    {tourBookings.map((booking, index) => {
                      const agentName =
                        (agentsToUse && agentsToUse.find((a) => a.id === booking.booking_agent_id)?.name) ||
                        booking.tour_guide ||
                        "Not selected"

                      const shipName = (ships && ships.find((s) => s.id === booking.ship_id)?.name) || "Not selected"

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 border rounded-md bg-gray-50"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">
                              {booking.tour_name !== "Select a tour" ? booking.tour_name : "Tour not selected"}
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>{booking.tour_date ? format(booking.tour_date, "PPP") : "No date selected"}</span>
                              <span>
                                {booking.total_pax} passengers ({booking.adults} adults, {booking.children} children)
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>Agent: {agentName}</span>
                              <span>Ship: {shipName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-800">
                              €{booking.price === 0 ? "0" : Math.round(booking.price)}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setActiveTourIndex(index)
                                setActiveTab("tour-bookings")
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Payment totals */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Payment Totals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-muted-foreground">Total Deposit</div>
                      <div className="text-xl font-semibold">
                        €{totalDeposit === 0 ? "0" : Math.round(totalDeposit)}
                      </div>
                    </div>
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-muted-foreground">Total Remaining</div>
                      <div className="text-xl font-semibold">
                        €{totalRemaining === 0 ? "0" : Math.round(totalRemaining)}
                      </div>
                    </div>
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-muted-foreground">Commission</div>
                      <div className="text-xl font-semibold">€{commission === 0 ? "0" : Math.round(commission)}</div>
                    </div>
                    <div className="p-3 border rounded-md bg-[#6b0f1a]/5">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-xl font-semibold">€{totalAmount === 0 ? "0" : Math.round(totalAmount)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_status" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#6b0f1a]" />
                    Payment Status
                  </Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger id="payment_status">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Deposit Paid</SelectItem>
                      <SelectItem value="paid">Fully Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_location" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#6b0f1a]" />
                    Payment Location
                  </Label>
                  <Input
                    id="payment_location"
                    placeholder="Where was the payment made?"
                    value={paymentLocation}
                    onChange={(e) => setPaymentLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission" className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-[#6b0f1a]" />
                    Commission (€)
                  </Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter total commission"
                    value={commission === 0 ? "" : commission}
                    onChange={(e) => setCommission(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#6b0f1a]" />
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about this booking"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#6b0f1a]" />
                    Other Information
                  </Label>
                  <Textarea
                    id="other"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="Any other information"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("tour-bookings")}>
                  Back
                </Button>
                <Button type="submit" className="bg-[#6b0f1a] hover:bg-[#8a1325]" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Booking"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </>
  )
}

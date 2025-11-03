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
  Search,
  Plus,
  Mail,
  Phone,
  FileText,
  Euro,
  CheckCircle,
  Trash2,
  PlusCircle,
  Edit,
  Minus,
  Gift,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { createMultipleBookings } from "@/app/actions/booking-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import AddTourModal from "@/components/add-tour-modal"
import CustomerSearchModal from "@/components/customer-search-modal"
import TourOptionsModal, { TourOptions } from "@/components/tour-options-modal"
import { Badge } from "@/components/ui/badge"

interface Tour {
  id: string
  name: string
  ship_name: string
  location: string
  price: number
  children_price?: number
}

interface ShipType {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
}

interface Agent {
  id: string
  name: string
  commission_rate?: number
}

interface BookingAgent {
  id: string
  name: string
}

interface TourBooking {
  id: string // Unique ID for this tour booking (client-side only)
  tourId: string
  tourName: string
  shipName: string
  date: Date | undefined
  adults: number
  children: number
  totalPax: number
  price: number
  adultPrice: number // NEW: Adult price per person
  childrenPrice: number // NEW: Children price per person
  deposit: number
  remaining: number
  bookingAgentId: string
  shipId: string
  // For display purposes
  bookingAgentName?: string
  shipName_display?: string
  // Tour options
  tourOptions?: {
    discountType: "none" | "percentage" | "fixed" | "free"
    discountValue: number
    finalPrice: number
    originalPrice: number
  }
}

interface AddBookingFormProps {
  tours: Tour[]
  ships: ShipType[]
  locations: Location[]
  agents: Agent[]
  bookingAgents: BookingAgent[]
}

// Add this helper function at the top of the component, after the interfaces
const getCurrentTourBooking = (tourBookings: TourBooking[], activeTourIndex: number): TourBooking | null => {
  if (!tourBookings || tourBookings.length === 0 || activeTourIndex < 0 || activeTourIndex >= tourBookings.length) {
    return null
  }
  return tourBookings[activeTourIndex]
}

export default function AddBookingForm({
  tours = [],
  ships = [],
  locations = [],
  agents = [],
  bookingAgents = [],
}: AddBookingFormProps) {
  console.log("FORM: Initialized with booking agents:", bookingAgents)
  const [activeTab, setActiveTab] = useState("customer-info")
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([
    {
      id: "tour-" + Date.now(),
      tourId: "",
      tourName: "Select a tour",
      shipName: "",
      date: undefined,
      adults: 0,
      children: 0,
      totalPax: 0,
      price: 0,
      adultPrice: 0, // NEW: Initialize adult price
      childrenPrice: 0, // NEW: Initialize children price
      deposit: 0,
      remaining: 0,
      bookingAgentId: "",
      shipId: "",
      bookingAgentName: "",
      shipName_display: "",
    },
  ])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddTourModal, setShowAddTourModal] = useState(false)
  const [showTourOptionsModal, setShowTourOptionsModal] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false)
  const [newBookingIds, setNewBookingIds] = useState<string[]>([])
  const [activeTourIndex, setActiveTourIndex] = useState(0)
  const [isRefreshingAgents, setIsRefreshingAgents] = useState(false)
  const [commission, setCommission] = useState(0)

  const [paymentLocation, setPaymentLocation] = useState("")
  const [other, setOther] = useState("")

  const router = useRouter()

  // Initialize booking agents from props and add auto-refresh functionality
  const [currentBookingAgents, setCurrentBookingAgents] = useState<BookingAgent[]>(bookingAgents || [])

  // Auto-refresh booking agents when the component becomes visible or when user interacts
  const refreshBookingAgents = useCallback(async () => {
    try {
      const { getBookingAgents } = await import("@/app/actions/booking-agent-actions")
      const freshAgents = await getBookingAgents()

      // Only update if there are actual changes to avoid unnecessary re-renders
      if (JSON.stringify(freshAgents) !== JSON.stringify(currentBookingAgents)) {
        console.log("FORM: Refreshed agents - found changes:", freshAgents)
        setCurrentBookingAgents(freshAgents)
      }
    } catch (error) {
      console.error("FORM: Failed to refresh agents:", error)
    }
  }, [currentBookingAgents])

  // Auto-refresh agents periodically and when tab becomes visible
  useEffect(() => {
    // Initial refresh after component mount
    refreshBookingAgents()

    // Set up periodic refresh every 3 seconds when the tab is active
    const interval = setInterval(() => {
      if (!document.hidden && activeTab === "tour-bookings") {
        refreshBookingAgents()
      }
    }, 3000)

    // Refresh when the page becomes visible again (user returns from another tab/window)
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === "tour-bookings") {
        refreshBookingAgents()
      }
    }

    // Refresh when user focuses on the window
    const handleFocus = () => {
      if (activeTab === "tour-bookings") {
        refreshBookingAgents()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    // Cleanup
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [refreshBookingAgents, activeTab])

  // Also refresh when switching to tour-bookings tab
  useEffect(() => {
    if (activeTab === "tour-bookings") {
      refreshBookingAgents()
    }
  }, [activeTab, refreshBookingAgents])

  // Ensure activeTourIndex is always valid
  useEffect(() => {
    if (activeTourIndex >= tourBookings.length) {
      setActiveTourIndex(Math.max(0, tourBookings.length - 1))
    }
  }, [tourBookings.length, activeTourIndex])

  // Sync deposit amounts across all tours when first tour's deposit changes
  useEffect(() => {
    if (tourBookings.length > 1) {
      const firstTourDeposit = tourBookings[0]?.deposit || 0

      // Update all subsequent tours with the first tour's deposit
      const updatedBookings = tourBookings.map((booking, index) => {
        if (index === 0) return booking // Keep first tour unchanged

        // Update subsequent tours with first tour's deposit and recalculate remaining
        const newRemaining = booking.price - firstTourDeposit
        return {
          ...booking,
          deposit: firstTourDeposit,
          remaining: Math.round(newRemaining),
        }
      })

      // Only update state if there are actual changes to prevent infinite loops
      const hasChanges = updatedBookings.some(
        (booking, index) =>
          index > 0 &&
          (booking.deposit !== tourBookings[index].deposit || booking.remaining !== tourBookings[index].remaining),
      )

      if (hasChanges) {
        setTourBookings(updatedBookings)
      }
    }
  }, [tourBookings[0]?.deposit, tourBookings.length])

  // Calculate total across all tours
  const totalAmountBeforeCommission = tourBookings.reduce((sum, booking) => sum + booking.price, 0)
  const totalAmount = totalAmountBeforeCommission - commission
  const totalDeposit = tourBookings.reduce((sum, booking) => sum + booking.deposit, 0)
  const totalRemainingBeforeCommission = tourBookings.reduce((sum, booking) => sum + booking.remaining, 0)
  const totalRemaining = totalRemainingBeforeCommission - commission

  // Function to refresh booking agents manually
  const handleRefreshAgents = useCallback(async () => {
    setIsRefreshingAgents(true)
    try {
      const { getBookingAgents } = await import("@/app/actions/booking-agent-actions")
      const freshAgents = await getBookingAgents()
      console.log("FORM: Manually refreshed agents:", freshAgents)
      setCurrentBookingAgents(freshAgents)
    } catch (error) {
      console.error("FORM: Failed to refresh agents:", error)
    } finally {
      setIsRefreshingAgents(false)
    }
  }, [])

  // Add a new tour booking
  const addTourBooking = useCallback(() => {
    setTourBookings((prev) => {
      // Get passenger info from the first tour if it exists
      const firstTour = prev[0]
      const adultsFromFirst = firstTour?.adults || 0
      const childrenFromFirst = firstTour?.children || 0
      const totalPaxFromFirst = firstTour?.totalPax || 0

      return [
        ...prev,
        {
          id: "tour-" + Date.now() + "-" + prev.length,
          tourId: "",
          tourName: "Select a tour",
          shipName: "",
          date: undefined,
          adults: adultsFromFirst, // Copy from first tour
          children: childrenFromFirst, // Copy from first tour
          totalPax: totalPaxFromFirst, // Copy from first tour
          price: 0,
          adultPrice: 0, // NEW: Initialize adult price
          childrenPrice: 0, // NEW: Initialize children price
          deposit: 0,
          remaining: 0,
          bookingAgentId: "",
          shipId: "",
          bookingAgentName: "",
          shipName_display: "",
        },
      ]
    })
    // Set the active tour to the newly added one
    setActiveTourIndex((prev) => prev + 1)
  }, [])

  // Remove a tour booking
  const removeTourBooking = useCallback(
    (index: number) => {
      if (tourBookings.length <= 1) {
        setError("You must have at least one tour booking")
        return
      }

      setTourBookings((prev) => {
        const newTourBookings = [...prev]
        newTourBookings.splice(index, 1)
        return newTourBookings
      })

      // Adjust active tour index if needed
      setActiveTourIndex((prev) => {
        if (prev >= tourBookings.length - 1) {
          return Math.max(0, tourBookings.length - 2)
        }
        return prev
      })
    },
    [tourBookings.length],
  )

  // Update a specific tour booking
  const updateTourBooking = useCallback((index: number, updates: Partial<TourBooking>) => {
    setTourBookings((prev) => {
      const newTourBookings = [...prev]
      newTourBookings[index] = { ...newTourBookings[index], ...updates }
      return newTourBookings
    })
  }, [])

  // Calculate tour price based on adult and children prices
  const calculateTourPrice = useCallback(
    (index: number, adultPrice: number, childrenPrice: number, adults: number, children: number) => {
      let totalPrice = 0

      // If both adult and children prices are 0, try to fallback to original tour price
      if (adultPrice === 0 && childrenPrice === 0) {
        const currentBooking = getCurrentTourBooking(tourBookings, index)
        if (currentBooking?.tourId) {
          const tour = tours.find((t) => t.id === currentBooking.tourId)
          if (tour) {
            totalPrice = Math.round(Number.parseFloat(tour.price.toString()))
          }
        }
      } else {
        // Calculate based on individual prices
        totalPrice = adultPrice * adults + childrenPrice * children
      }

      const currentBooking = getCurrentTourBooking(tourBookings, index)
      const currentDeposit = currentBooking?.deposit || 0
      const remaining = totalPrice - currentDeposit

      updateTourBooking(index, {
        adultPrice: Math.round(adultPrice),
        childrenPrice: Math.round(childrenPrice),
        price: Math.round(totalPrice),
        remaining: Math.round(remaining),
      })
    },
    [tourBookings, updateTourBooking, tours],
  )

  // Calculate total passengers for a specific tour
  const calculateTotalPax = useCallback(
    (index: number, adults: number, children: number) => {
      const totalPax = adults + children
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      const adultPrice = currentBooking?.adultPrice || 0
      const childrenPrice = currentBooking?.childrenPrice || 0

      // If updating the first tour (index 0) and there are multiple tours, sync all tours
      if (index === 0 && tourBookings.length > 1) {
        const updatedBookings = tourBookings.map((booking, i) => {
          if (i === 0) {
            // Update first tour with new passenger counts
            return {
              ...booking,
              adults,
              children,
              totalPax,
            }
          } else {
            // Sync all other tours with the same passenger counts
            return {
              ...booking,
              adults,
              children,
              totalPax,
            }
          }
        })
        setTourBookings(updatedBookings)
        
        // Recalculate prices for all tours
        updatedBookings.forEach((booking, i) => {
          const tourAdultPrice = booking.adultPrice || 0
          const tourChildrenPrice = booking.childrenPrice || 0
          calculateTourPrice(i, tourAdultPrice, tourChildrenPrice, adults, children)
        })
      } else {
        // Normal update for single tour or non-first tour
        updateTourBooking(index, { adults, children, totalPax })
        // Recalculate tour price based on new passenger counts
        calculateTourPrice(index, adultPrice, childrenPrice, adults, children)
      }
    },
    [updateTourBooking, calculateTourPrice, tourBookings],
  )

  // Calculate remaining balance for a specific tour
  const calculateRemaining = useCallback(
    (index: number, price: number, deposit: number) => {
      const remaining = price - deposit

      if (index === 0 && tourBookings.length > 1) {
        // If updating first tour's deposit and there are multiple tours, sync all tours
        const updatedBookings = tourBookings.map((booking, i) => {
          if (i === 0) {
            return {
              ...booking,
              price: Math.round(price),
              deposit: Math.round(deposit),
              remaining: Math.round(remaining),
            }
          } else {
            // Update subsequent tours with the same deposit
            const newRemaining = booking.price - deposit
            return {
              ...booking,
              deposit: Math.round(deposit),
              remaining: Math.round(newRemaining),
            }
          }
        })
        setTourBookings(updatedBookings)
      } else if (index === 0 || tourBookings.length === 1) {
        // Normal update for single tour or first tour when no sync needed
        updateTourBooking(index, {
          price: Math.round(price),
          deposit: Math.round(deposit),
          remaining: Math.round(remaining),
        })
      }
      // For subsequent tours (index > 0), don't allow direct deposit changes
    },
    [tourBookings, updateTourBooking],
  )

  // Handle tour selection - Updated to use location instead of ship name
  const handleTourChange = useCallback(
    (index: number, tourId: string) => {
      if (tourId && tourId !== "no-tour-selected") {
        const tour = tours.find((t) => t.id === tourId)
        if (tour) {
          const baseTourPrice = Math.round(Number.parseFloat(tour.price.toString()))
          const tourChildrenPrice = tour.children_price || 0
          const deposit = 0 // Start with zero deposit

          // Get passenger counts from Tour 1 if this is not the first tour
          let adults = 1
          let children = 0
          let totalPax = 1
          
          if (index > 0 && tourBookings.length > 0) {
            const tour1Booking = getCurrentTourBooking(tourBookings, 0)
            adults = tour1Booking?.adults || 1
            children = tour1Booking?.children || 0
            totalPax = tour1Booking?.totalPax || 1
          }

          // Calculate the correct total price based on actual passenger counts
          const calculatedPrice = (baseTourPrice * adults) + (tourChildrenPrice * children)

          updateTourBooking(index, {
            tourId,
            tourName: `${tour.name} - ${tour.location || "Unknown Location"}`,
            shipName: tour.ship_name,
            adults,
            children,
            totalPax,
            price: calculatedPrice, // Use calculated price based on actual passengers
            adultPrice: baseTourPrice, // Adult price per person
            childrenPrice: tourChildrenPrice, // Children price per person
            deposit,
            remaining: calculatedPrice - deposit,
            tourOptions: undefined, // Clear tour options when tour changes
          })
        }
      }
    },
    [tours, updateTourBooking, tourBookings],
  )

  // Handle tour options
  const handleTourOptions = useCallback(
    (index: number, options: TourOptions) => {
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      if (!currentBooking) return

      // Calculate new price based on options
      let newPrice = currentBooking.price
      let newRemaining = currentBooking.remaining

      if (options.discountType === "free") {
        newPrice = 0
        newRemaining = 0
      } else if (options.discountType === "percentage") {
        newPrice = Math.max(0, currentBooking.price - (currentBooking.price * options.discountValue / 100))
        newRemaining = Math.max(0, newPrice - currentBooking.deposit)
      } else if (options.discountType === "fixed") {
        newPrice = Math.max(0, currentBooking.price - options.discountValue)
        newRemaining = Math.max(0, newPrice - currentBooking.deposit)
      }

      updateTourBooking(index, {
        price: newPrice,
        remaining: newRemaining,
        tourOptions: {
          ...options,
          originalPrice: currentBooking.price,
        },
      })
    },
    [tourBookings, updateTourBooking],
  )

  // Handle booking agent selection
  const handleBookingAgentChange = useCallback(
    (index: number, agentId: string) => {
      if (agentId === "no-agent-selected" || !agentId) {
        updateTourBooking(index, {
          bookingAgentId: "",
          bookingAgentName: "",
        })
        return
      }

      const agent = currentBookingAgents.find((a) => a.id === agentId)

      updateTourBooking(index, {
        bookingAgentId: agentId, // Store the ID
        bookingAgentName: agent?.name || "", // Store the name for display
      })
    },
    [currentBookingAgents, updateTourBooking],
  )

  // Update the handleShipChange function:
  const handleShipChange = useCallback(
    (index: number, shipId: string) => {
      if (shipId === "no-ship-selected" || !shipId) {
        // If clearing ship for first tour, sync to all tours
        if (index === 0 && tourBookings.length > 1) {
          const updatedBookings = tourBookings.map((booking) => ({
            ...booking,
            shipId: "",
            shipName_display: "",
          }))
          setTourBookings(updatedBookings)
        } else {
          updateTourBooking(index, {
            shipId: "",
            shipName_display: "",
          })
        }
        return
      }

      // Use the ships prop passed to the component
      const ship = ships.find((s) => s.id === shipId)

      if (ship) {
        // If changing ship for first tour, sync to all tours
        if (index === 0 && tourBookings.length > 1) {
          const updatedBookings = tourBookings.map((booking) => ({
            ...booking,
            shipId,
            shipName_display: ship.name || "",
          }))
          setTourBookings(updatedBookings)
        } else {
          updateTourBooking(index, {
            shipId,
            shipName_display: ship.name || "",
          })
        }
      }
    },
    [ships, updateTourBooking, tourBookings],
  )

  // Handle increment/decrement for adults
  const handleAdultsIncrement = useCallback(
    (index: number) => {
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      if (currentBooking) {
        const newAdults = (currentBooking.adults || 0) + 1
        calculateTotalPax(index, newAdults, currentBooking.children || 0)
      }
    },
    [tourBookings, calculateTotalPax],
  )

  const handleAdultsDecrement = useCallback(
    (index: number) => {
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      if (currentBooking && currentBooking.adults > 0) {
        const newAdults = Math.max(0, (currentBooking.adults || 0) - 1)
        calculateTotalPax(index, newAdults, currentBooking.children || 0)
      }
    },
    [tourBookings, calculateTotalPax],
  )

  // Handle increment/decrement for children
  const handleChildrenIncrement = useCallback(
    (index: number) => {
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      if (currentBooking) {
        const newChildren = (currentBooking.children || 0) + 1
        calculateTotalPax(index, currentBooking.adults || 0, newChildren)
      }
    },
    [tourBookings, calculateTotalPax],
  )

  const handleChildrenDecrement = useCallback(
    (index: number) => {
      const currentBooking = getCurrentTourBooking(tourBookings, index)
      if (currentBooking && currentBooking.children > 0) {
        const newChildren = Math.max(0, (currentBooking.children || 0) - 1)
        calculateTotalPax(index, currentBooking.adults || 0, newChildren)
      }
    },
    [tourBookings, calculateTotalPax],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate data
      if (!customerName || !customerEmail) {
        throw new Error("Customer name and email are required")
      }

      if (tourBookings.length === 0) {
        throw new Error("At least one tour booking is required")
      }

      // Prepare booking data with proper booking_agent_id mapping
      const bookingsToCreate = tourBookings.map((booking) => {
        // Calculate the proportional commission for this booking
        const bookingProportion = booking.price / totalAmountBeforeCommission
        const bookingCommission = totalAmountBeforeCommission > 0 ? commission * bookingProportion : 0
        const adjustedRemaining = Math.max(0, booking.remaining - bookingCommission)

        return {
          tour_id: booking.tourId,
          tour_date: booking.date ? format(booking.date, "yyyy-MM-dd") : null,
          adults: booking.adults,
          children: booking.children,
          total_pax: booking.totalPax,
          price: booking.price,
          adult_price: booking.adultPrice,
          children_price: booking.childrenPrice,
          deposit: booking.deposit,
          remaining_balance: adjustedRemaining,
          booking_agent_id: booking.bookingAgentId || null,
          ship_id: booking.shipId || null,
          tour_guide: booking.bookingAgentName || "",
          notes: "",
        }
      })

      // Customer data
      const customerData = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        notes: notes,
        payment_status: paymentStatus,
        payment_location: paymentLocation,
        other_information: other,
        commission: commission, // Add this line
      }

      // Call the action
      const result = await createMultipleBookings(customerData, bookingsToCreate)

      if (result && result.success) {
        setSuccess("Bookings created successfully!")
        setNewBookingIds(result.bookingIds || [])
        // Reset form fields
        setTourBookings([
          {
            id: "tour-" + Date.now(),
            tourId: "",
            tourName: "Select a tour",
            shipName: "",
            date: undefined,
            adults: 0,
            children: 0,
            totalPax: 0,
            price: 0,
            adultPrice: 0, // NEW: Initialize adult price
            childrenPrice: 0, // NEW: Initialize children price
            deposit: 0,
            remaining: 0,
            bookingAgentId: "",
            shipId: "",
            bookingAgentName: "",
            shipName_display: "",
          },
        ])
        setCustomerName("")
        setCustomerEmail("")
        setCustomerPhone("")
        setNotes("")
        setPaymentStatus("pending")
        setPaymentLocation("")
        setOther("")
        setActiveTab("customer-info")
        setCommission(0)
      } else {
        setError(result.error || "Failed to create bookings. Please check the form.")
      }
    } catch (e) {
      setError((e as Error).message || "An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectCustomer = useCallback((customer: any) => {
    setCustomerName(customer.name)
    setCustomerEmail(customer.email)
    setCustomerPhone(customer.phone)
    setCustomerSearchModalOpen(false)
  }, [])

  // Replace the existing handleTourAdded function with this enhanced version:
  const handleTourAdded = useCallback(
    async (newTour: any) => {
      if (newTour) {
        console.log("New tour added:", newTour)

        // Refresh the tours list to include the new tour
        try {
          const { getTours } = await import("@/app/actions/tour-actions")
          const updatedTours = await getTours()

          // Update the tours prop (this would need to be passed down from parent or managed in state)
          // For now, we'll automatically select the new tour in the current booking
          if (newTour.id) {
            handleTourChange(activeTourIndex, newTour.id)
          }

          // Show success message
          setSuccess(`Tour "${newTour.name}" created and selected successfully!`)

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
          console.error("Failed to refresh tours list:", error)
        }
      }

      setShowAddTourModal(false)
    },
    [activeTourIndex, handleTourChange, setSuccess, setShowAddTourModal],
  )

  // Handle adding new booking agent from the form
  const handleAddNewAgent = useCallback(() => {
    // Navigate to agents page to add new agent
    router.push("/dashboard/agents")
  }, [router])

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-lg">🎉 Booking Created Successfully!</div>
                <div className="text-sm text-green-700">{success}</div>
              </div>
              {newBookingIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newBookingIds.map((id, index) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-green-50 border-green-300 text-green-800 shadow-sm"
                      onClick={async () => {
                        try {
                          const { getBookingForReceipt } = await import("@/app/actions/receipt-actions")
                          const { generateReceiptPDF } = await import("@/lib/pdf-generator")

                          const booking = await getBookingForReceipt(id)

                          if (!booking) {
                            throw new Error(`Booking not found with ID: ${id}`)
                          }

                          const pdfData = {
                            ...booking,
                            tour_name:
                              booking.tours && booking.tours.length > 0 ? booking.tours[0].tour_name : "Multiple Tours",
                            ship_name:
                              booking.tours && booking.tours.length > 0 ? booking.tours[0].ship_name : "Various Ships",
                            location:
                              booking.tours && booking.tours.length > 0
                                ? booking.tours[0].location
                                : "Various Locations",
                            tour_date: booking.tours && booking.tours.length > 0 ? booking.tours[0].tour_date : null,
                            adults: booking.tours
                              ? booking.tours.reduce((sum, tour) => sum + (tour.adults || 0), 0)
                              : 0,
                            children: booking.tours
                              ? booking.tours.reduce((sum, tour) => sum + (tour.children || 0), 0)
                              : 0,
                            total_pax: booking.tours
                              ? booking.tours.reduce((sum, tour) => sum + (tour.total_pax || 0), 0)
                              : 0,
                            deposit: booking.total_deposit,
                            remaining_balance: booking.total_remaining_balance,
                          }

                          const blob = await generateReceiptPDF(pdfData)
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement("a")
                          link.href = url
                          link.download = `receipt-${booking.booking_reference || id}.pdf`
                          link.style.display = "none"

                          document.body.appendChild(link)

                          setTimeout(() => {
                            try {
                              link.click()
                              if (link.parentNode) {
                                link.parentNode.removeChild(link)
                              }
                              URL.revokeObjectURL(url)
                            } catch (cleanupError) {
                              console.warn("Error during cleanup:", cleanupError)
                              URL.revokeObjectURL(url)
                            }
                          }, 100)
                        } catch (error) {
                          console.error("Failed to generate receipt:", error)
                          alert(`Failed to generate receipt: ${error instanceof Error ? error.message : String(error)}`)
                        }
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                  ))}
                </div>
              )}
            </div>
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
                <CardDescription>Enter the customer's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#6b0f1a]" />
                    Customer Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="customer_name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCustomerSearchModalOpen(true)}
                      className="shrink-0"
                    >
                      <Search className="h-4 w-4" />
                      <span className="sr-only md:sr-only md:not-sr-only md:ml-2">Search</span>
                    </Button>
                  </div>
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
                    <CardDescription>Add one or more tours for this customer</CardDescription>
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
                            {getCurrentTourBooking(tourBookings, activeTourIndex)?.date ? (
                              format(getCurrentTourBooking(tourBookings, activeTourIndex)!.date!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={getCurrentTourBooking(tourBookings, activeTourIndex)?.date}
                            onSelect={(date) => updateTourBooking(activeTourIndex, { date })}
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
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            value={getCurrentTourBooking(tourBookings, activeTourIndex)?.tourId || ""}
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
                                    {tour.name} - {tour.location || "Unknown Location"}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowAddTourModal(true)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add new tour</span>
                        </Button>
                      </div>
                      {/* Tour Options Button - Only show for tours other than the first one and when a tour is selected */}
                      {activeTourIndex > 0 && getCurrentTourBooking(tourBookings, activeTourIndex)?.tourId && getCurrentTourBooking(tourBookings, activeTourIndex)?.tourId !== "no-tour-selected" && getCurrentTourBooking(tourBookings, activeTourIndex)?.tourName !== "Select a tour" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTourOptionsModal(true)}
                          className="shrink-0 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Options
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`adults-${activeTourIndex}`} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#6b0f1a]" />
                        Number of Adults
                        {activeTourIndex > 0 && (
                          <span className="text-xs text-gray-500">(Controlled by Tour 1)</span>
                        )}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdultsDecrement(activeTourIndex)}
                          disabled={activeTourIndex > 0 || !getCurrentTourBooking(tourBookings, activeTourIndex)?.adults || getCurrentTourBooking(tourBookings, activeTourIndex)?.adults <= 0}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id={`adults-${activeTourIndex}`}
                          type="number"
                          min="0"
                          value={activeTourIndex > 0 ? getCurrentTourBooking(tourBookings, 0)?.adults : getCurrentTourBooking(tourBookings, activeTourIndex)?.adults}
                          onChange={(e) => {
                            if (activeTourIndex > 0) return // Disable for non-first tours
                            const value = Number.parseInt(e.target.value) || 0
                            const currentBooking = getCurrentTourBooking(tourBookings, activeTourIndex)
                            calculateTotalPax(activeTourIndex, value, currentBooking?.children || 0)
                          }}
                          className="text-center"
                          disabled={activeTourIndex > 0}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdultsIncrement(activeTourIndex)}
                          disabled={activeTourIndex > 0}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`children-${activeTourIndex}`} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#6b0f1a]" />
                        Number of Children
                        {activeTourIndex > 0 && (
                          <span className="text-xs text-gray-500">(Controlled by Tour 1)</span>
                        )}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleChildrenDecrement(activeTourIndex)}
                          disabled={activeTourIndex > 0 || !getCurrentTourBooking(tourBookings, activeTourIndex)?.children || getCurrentTourBooking(tourBookings, activeTourIndex)?.children <= 0}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id={`children-${activeTourIndex}`}
                          type="number"
                          min="0"
                          value={activeTourIndex > 0 ? getCurrentTourBooking(tourBookings, 0)?.children : getCurrentTourBooking(tourBookings, activeTourIndex)?.children}
                          onChange={(e) => {
                            if (activeTourIndex > 0) return // Disable for non-first tours
                            const value = Number.parseInt(e.target.value) || 0
                            const currentBooking = getCurrentTourBooking(tourBookings, activeTourIndex)
                            calculateTotalPax(activeTourIndex, currentBooking?.adults || 0, value)
                          }}
                          className="text-center"
                          disabled={activeTourIndex > 0}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleChildrenIncrement(activeTourIndex)}
                          disabled={activeTourIndex > 0}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`total-pax-${activeTourIndex}`} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#6b0f1a]" />
                        Total Passengers
                        {activeTourIndex > 0 && (
                          <span className="text-xs text-gray-500">(Controlled by Tour 1)</span>
                        )}
                      </Label>
                      <Input
                        id={`total-pax-${activeTourIndex}`}
                        type="number"
                        min="0"
                        value={activeTourIndex > 0 ? getCurrentTourBooking(tourBookings, 0)?.totalPax : getCurrentTourBooking(tourBookings, activeTourIndex)?.totalPax}
                        readOnly
                        className={activeTourIndex > 0 ? "bg-gray-100" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`booking-agent-${activeTourIndex}`} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#6b0f1a]" />
                        Name of Booking Agent
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            value={getCurrentTourBooking(tourBookings, activeTourIndex)?.bookingAgentId || ""}
                            onValueChange={(value) => handleBookingAgentChange(activeTourIndex, value)}
                          >
                            <SelectTrigger id={`booking-agent-${activeTourIndex}`}>
                              <SelectValue placeholder="Select booking agent" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="no-agent-selected">No agent selected</SelectItem>
                              {currentBookingAgents &&
                                currentBookingAgents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRefreshAgents}
                          disabled={isRefreshingAgents}
                          className="shrink-0"
                          title="Refresh agents list"
                        >
                          {isRefreshingAgents ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                          <span className="sr-only">Refresh agents</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAddNewAgent}
                          className="shrink-0"
                          title="Add new agent"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add new agent</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`ship-${activeTourIndex}`} className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-[#6b0f1a]" />
                        Name of Ships
                        {activeTourIndex > 0 && (
                          <span className="text-xs text-gray-500">(Controlled by Tour 1)</span>
                        )}
                      </Label>
                      <Select
                        value={activeTourIndex > 0 ? getCurrentTourBooking(tourBookings, 0)?.shipId || "" : getCurrentTourBooking(tourBookings, activeTourIndex)?.shipId || ""}
                        onValueChange={(value) => {
                          if (activeTourIndex > 0) return // Disable for non-first tours
                          handleShipChange(activeTourIndex, value)
                        }}
                        disabled={activeTourIndex > 0}
                      >
                        <SelectTrigger id={`ship-${activeTourIndex}`} className={activeTourIndex > 0 ? "bg-gray-100" : ""}>
                          <SelectValue placeholder="Select ship" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="no-ship-selected">No ship selected</SelectItem>
                          {ships &&
                            ships.map((ship) => (
                              <SelectItem key={ship.id} value={ship.id}>
                                {ship.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`tour-price-${activeTourIndex}`} className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-[#6b0f1a]" />
                        Tour Price (Total)
                      </Label>
                      <Input
                        id={`tour-price-${activeTourIndex}`}
                        placeholder="0"
                        type="number"
                        min="0"
                        readOnly
                        value={
                          getCurrentTourBooking(tourBookings, activeTourIndex)?.price === 0
                            ? ""
                            : Math.round(getCurrentTourBooking(tourBookings, activeTourIndex)?.price || 0)
                        }
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
                        value={
                          getCurrentTourBooking(tourBookings, activeTourIndex)?.adultPrice === 0
                            ? ""
                            : Math.round(getCurrentTourBooking(tourBookings, activeTourIndex)?.adultPrice || 0)
                        }
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 0
                          const currentBooking = getCurrentTourBooking(tourBookings, activeTourIndex)
                          calculateTourPrice(
                            activeTourIndex,
                            value,
                            currentBooking?.childrenPrice || 0,
                            currentBooking?.adults || 0,
                            currentBooking?.children || 0,
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
                        value={
                          getCurrentTourBooking(tourBookings, activeTourIndex)?.childrenPrice === 0
                            ? ""
                            : Math.round(getCurrentTourBooking(tourBookings, activeTourIndex)?.childrenPrice || 0)
                        }
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 0
                          const currentBooking = getCurrentTourBooking(tourBookings, activeTourIndex)
                          calculateTourPrice(
                            activeTourIndex,
                            currentBooking?.adultPrice || 0,
                            value,
                            currentBooking?.adults || 0,
                            currentBooking?.children || 0,
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
                        disabled={activeTourIndex > 0 && tourBookings.length > 1}
                        value={
                          getCurrentTourBooking(tourBookings, activeTourIndex)?.deposit === 0
                            ? ""
                            : Math.round(getCurrentTourBooking(tourBookings, activeTourIndex)?.deposit || 0)
                        }
                        onChange={(e) => {
                          if (activeTourIndex === 0 || tourBookings.length === 1) {
                            const value = Number.parseInt(e.target.value) || 0
                            const currentBooking = getCurrentTourBooking(tourBookings, activeTourIndex)
                            calculateRemaining(activeTourIndex, currentBooking?.price || 0, value)
                          }
                        }}
                      />
                      {activeTourIndex > 0 && tourBookings.length > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">💡 Deposit amount is controlled by Tour 1</p>
                      )}
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
                          getCurrentTourBooking(tourBookings, activeTourIndex)?.remaining === 0
                            ? ""
                            : Math.round(getCurrentTourBooking(tourBookings, activeTourIndex)?.remaining || 0)
                        }
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">💡 Calculated as Tour Price - Deposit</p>
                    </div>
                  </div>
                </div>
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
                <CardDescription>Review and finalize payment details for all tours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tour summary */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-lg">Tour Summary</h3>
                  <div className="space-y-3">
                    {tourBookings.map((booking, index) => {
                      // Find agent name from ID
                      const agentName =
                        (currentBookingAgents &&
                          currentBookingAgents.find((a) => a.id === booking.bookingAgentId)?.name) ||
                        "Not selected"

                      // Find ship name from ID
                      const shipName = (ships && ships.find((s) => s.id === booking.shipId)?.name) || "Not selected"

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 border rounded-md bg-gray-50"
                        >
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {booking.tourName !== "Select a tour" ? booking.tourName : "Tour not selected"}
                              {booking.tourOptions && booking.tourOptions.discountType !== "none" && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Gift className="h-3 w-3 mr-1" />
                                  {booking.tourOptions.discountType === "free" && "Free"}
                                  {booking.tourOptions.discountType === "percentage" && `${booking.tourOptions.discountValue}% off`}
                                  {booking.tourOptions.discountType === "fixed" && `€${booking.tourOptions.discountValue} off`}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>{booking.date ? format(booking.date, "PPP") : "No date selected"}</span>
                              <span>
                                {booking.totalPax} passengers ({booking.adults} adults, {booking.children} children)
                              </span>
                            </div>
                            {/* Show booking agent and ship in summary */}
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>Agent: {agentName}</span>
                              <span>Ship: {shipName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end">
                              {booking.tourOptions && booking.tourOptions.discountType !== "none" && (
                                <div className="text-xs text-gray-500 line-through">
                                  €{Math.round(booking.tourOptions.originalPrice)}
                                </div>
                              )}
                              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                €{booking.price === 0 ? "0" : Math.round(booking.price)}
                              </Badge>
                            </div>
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
                        €{totalRemaining <= 0 ? "0" : Math.round(totalRemaining)}
                      </div>
                      {commission > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          (€{Math.round(totalRemainingBeforeCommission)} - €{Math.round(commission)} commission)
                        </div>
                      )}
                    </div>
                    <div className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-muted-foreground">Commission</div>
                      <div className="text-xl font-semibold">€{commission === 0 ? "0" : Math.round(commission)}</div>
                    </div>
                    <div className="p-3 border rounded-md bg-[#6b0f1a]/5">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-xl font-semibold">€{totalAmount <= 0 ? "0" : Math.round(totalAmount)}</div>
                      {commission > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          (€{Math.round(totalAmountBeforeCommission)} - €{Math.round(commission)} commission)
                        </div>
                      )}
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
                      <SelectValue />
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
                  {isSubmitting ? "Saving..." : "Save Bookings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
      {/* Customer Search Modal */}
      <CustomerSearchModal
        open={customerSearchModalOpen}
        onOpenChange={setCustomerSearchModalOpen}
        onSelectCustomer={handleSelectCustomer}
      />
      {showAddTourModal && (
        <Dialog open={showAddTourModal} onOpenChange={setShowAddTourModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tour</DialogTitle>
              <DialogDescription>Create a new tour that will be available for bookings</DialogDescription>
            </DialogHeader>
            <AddTourModal ships={ships} locations={locations} onTourAdded={handleTourAdded} />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Tour Options Modal */}
      <TourOptionsModal
        isOpen={showTourOptionsModal}
        onClose={() => setShowTourOptionsModal(false)}
        onApplyOptions={(options) => handleTourOptions(activeTourIndex, options)}
        tourName={getCurrentTourBooking(tourBookings, activeTourIndex)?.tourName || ""}
        originalPrice={getCurrentTourBooking(tourBookings, activeTourIndex)?.price || 0}
      />
    </>
  )
}

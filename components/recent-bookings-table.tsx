"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"
import DeleteBookingDialog from "./delete-booking-dialog"
import { useRouter } from "next/navigation"
import DownloadReceiptButton from "./download-receipt-button"
import SendBookingEmailButton from "./send-booking-email-button"
import { fetchBookingTours } from "@/app/actions/dashboard-actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Tour {
  id: string
  tour_name: string
  ship_name: string
  tour_date: string
  adults: number
  children: number
  total_pax: number
  price: number
  location: string
  notes?: string
  tour_guide?: string
  vehicles?: string
  total_net?: number
}

interface Booking {
  id: string
  booking_reference: string
  created_at: string
  tour_date?: string
  customer_name: string
  email: string
  phone: string
  agent_name?: string
  commission?: number
  status: string
  deposit: number
  remaining_balance: number
  total_payment: number
  total_pax: number
  tour_count: number
  tours?: Tour[]
  // New fields
  payment_location?: string
  tour_guide?: string
  vehicles?: string
  other?: string
  total_net?: number
}

export function RecentBookingsTable({ bookings = [] }: { bookings: Booking[] }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingTours, setBookingTours] = useState<Record<string, Tour[]>>({})
  const [loadingTours, setLoadingTours] = useState<Record<string, boolean>>({})
  const [visibleCount, setVisibleCount] = useState(10)
  const router = useRouter()

  // Check if booking has multiple tours
  const hasMultipleTours = (booking: Booking): boolean => {
    // If we have actual tour data, use that
    if (bookingTours[booking.id]) {
      return bookingTours[booking.id].length > 1
    }

    // If booking has tours array with more than 1 item
    if (booking.tours && booking.tours.length > 1) {
      return true
    }

    // If tour_count is explicitly set and greater than 1
    if (typeof booking.tour_count === "number" && booking.tour_count > 1) {
      return true
    }

    // For backward compatibility, if tour_count is a string, convert it
    if (typeof booking.tour_count === "string") {
      const count = Number.parseInt(booking.tour_count, 10)
      if (!isNaN(count) && count > 1) {
        return true
      }
    }

    return false
  }

  // Auto-fetch tour data for multi-tour bookings
  const autoFetchMultiTourData = async () => {
    const multiTourBookings = bookings.filter(hasMultipleTours)

    if (multiTourBookings.length === 0) return

    // Fetch tour data for all multi-tour bookings in parallel
    const fetchPromises = multiTourBookings.map(async (booking) => {
      if (!bookingTours[booking.id]) {
        setLoadingTours((prev) => ({ ...prev, [booking.id]: true }))
        try {
          const tours = await fetchBookingTours(booking.id)
          setBookingTours((prev) => ({ ...prev, [booking.id]: tours || [] }))
        } catch (error) {
          console.error(`Error fetching tours for booking ${booking.id}:`, error)
          setBookingTours((prev) => ({ ...prev, [booking.id]: [] }))
        } finally {
          setLoadingTours((prev) => ({ ...prev, [booking.id]: false }))
        }
      }
    })

    await Promise.all(fetchPromises)
  }

  // Auto-fetch tour data on component mount and when bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      autoFetchMultiTourData()
    }
  }, [bookings])

  const handleDeleteClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setDeleteDialogOpen(true)
  }

  // Get tours for a booking
  const getToursForBooking = (booking: Booking): Tour[] => {
    // If we have fetched tour data, use that
    if (bookingTours[booking.id]) {
      return bookingTours[booking.id]
    }

    // Otherwise use the tours array from the booking if available
    return booking.tours || []
  }

  // Sort tours by date when expanded
  const getSortedTours = (booking: Booking) => {
    const tours = getToursForBooking(booking)
    if (!tours || tours.length === 0) return []

    return [...tours].sort((a, b) => {
      if (!a.tour_date) return 1
      if (!b.tour_date) return -1

      const dateA = new Date(a.tour_date).getTime()
      const dateB = new Date(b.tour_date).getTime()

      return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB
    })
  }

  // Safely format numeric values
  const formatNumber = (value: any): string => {
    const num = Number(value)
    return isNaN(num) ? "0" : num.toString()
  }

  const formatCurrency = (value: any): string => {
    const num = Number(value)
    return isNaN(num) ? "€0.00" : `€${num.toFixed(2)}`
  }

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No date"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"

      return date.toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  // Get actual tour count
  const getActualTourCount = (booking: Booking): number => {
    // If we have fetched tour data, use that length
    if (bookingTours[booking.id]) {
      return bookingTours[booking.id].length
    }

    // If booking has tours array, use its length
    if (booking.tours && Array.isArray(booking.tours)) {
      return booking.tours.length
    }

    // Otherwise use the tour_count property
    if (typeof booking.tour_count === "number") {
      return booking.tour_count
    }

    // For backward compatibility, if tour_count is a string, convert it
    if (typeof booking.tour_count === "string") {
      const count = Number.parseInt(booking.tour_count, 10)
      if (!isNaN(count)) {
        return count
      }
    }

    // Default to 1 if we have a tour_id in the booking
    if (booking.tour_id) {
      return 1
    }

    return 0
  }

  // Display value with fallback
  const displayValue = (value: any, fallback = "-"): string => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    return value.toString()
  }

  const visibleBookings = bookings.slice(0, visibleCount)
  const hasMoreBookings = visibleCount < bookings.length

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, bookings.length))
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-red-900 hover:bg-red-800">
            <TableHead className="font-bold text-white border-r border-red-800 hover:text-white">ID</TableHead>
            <TableHead className="font-bold text-white hover:text-white">Date</TableHead>
            <TableHead className="font-bold text-white hover:text-white">Customer</TableHead>
            <TableHead className="text-center font-bold text-white hover:text-white">Tours</TableHead>
            <TableHead className="text-center font-bold text-white hover:text-white">Adults</TableHead>
            <TableHead className="text-center font-bold text-white hover:text-white">Children</TableHead>
            <TableHead className="text-center font-bold text-white hover:text-white">Total Pax</TableHead>
            <TableHead className="font-bold text-white hover:text-white">Total</TableHead>
            <TableHead className="font-bold text-white hover:text-white">Status</TableHead>
            <TableHead className="text-right font-bold text-white hover:text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No bookings found. Create your first booking to see it here.
              </TableCell>
            </TableRow>
          ) : (
            visibleBookings.map((booking) => {
              const tourCount = getActualTourCount(booking)
              const hasMultiple = hasMultipleTours(booking)

              return (
                <React.Fragment key={booking.id}>
                  <TableRow className={`${hasMultiple ? "bg-slate-50" : ""} `}>
                    <TableCell className="font-bold bg-red-900 border-r border-red-800 text-white text-base">
                      {booking.booking_reference}
                    </TableCell>
                    <TableCell>{formatDate(booking.tour_date || booking.created_at)}</TableCell>
                    <TableCell>{booking.customer_name || "Unknown Customer"}</TableCell>
                    <TableCell className="text-center">{tourCount > 0 ? formatNumber(tourCount) : "1"}</TableCell>
                    <TableCell className="text-center">{formatNumber(booking.adults || 0)}</TableCell>
                    <TableCell className="text-center">{formatNumber(booking.children || 0)}</TableCell>
                    <TableCell className="text-center">{formatNumber(booking.total_pax)}</TableCell>
                    <TableCell>{formatCurrency(booking.total_payment)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "outline"
                            : booking.status === "paid"
                              ? "default"
                              : "secondary"
                        }
                        className={
                          booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : booking.status === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        {booking.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/bookings/${booking.id}`}
                              className="flex items-center w-full cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/bookings/${booking.id}/edit`}
                              className="flex items-center w-full cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Booking</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <DownloadReceiptButton
                              bookingId={booking.id}
                              variant="ghost"
                              size="sm"
                              className="flex w-full items-center justify-start p-0 h-auto font-normal text-sm"
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            <SendBookingEmailButton
                              booking={booking}
                              variant="ghost"
                              size="sm"
                              className="flex w-full items-center justify-start p-0 h-auto font-normal text-sm"
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(booking)}
                            className="flex items-center text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Booking</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Always show tour details for multi-tour bookings */}
                  {hasMultiple && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-0 border-t-0">
                        <div className="bg-slate-50 p-4">
                          <h4 className="font-medium mb-2">
                            Tours in this booking ({getSortedTours(booking).length} tours)
                          </h4>
                          <div className="overflow-x-auto">
                            {loadingTours[booking.id] ? (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>Loading tour details...</p>
                              </div>
                            ) : getToursForBooking(booking).length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="font-bold w-12">#</TableHead>
                                    <TableHead className="font-bold">Tour</TableHead>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Ship</TableHead>
                                    <TableHead className="text-center font-bold">Adults</TableHead>
                                    <TableHead className="text-center font-bold">Children</TableHead>
                                    <TableHead className="text-center font-bold">Total Pax</TableHead>
                                    <TableHead className="font-bold">Price</TableHead>
                                    <TableHead className="font-bold">NET</TableHead>
                                    <TableHead className="font-bold">Tour Guide</TableHead>
                                    <TableHead className="font-bold">Payment Location</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getSortedTours(booking).map((tour, index) => (
                                    <TableRow key={tour.id}>
                                      <TableCell className="font-bold text-center bg-amber-50 border-r border-amber-100 text-amber-900">
                                        {index + 1}
                                      </TableCell>
                                      <TableCell>{tour.tour_name || "Unknown Tour"}</TableCell>
                                      <TableCell>{formatDate(tour.tour_date)}</TableCell>
                                      <TableCell>{tour.ship_name || "Unknown Ship"}</TableCell>
                                      <TableCell className="text-center">{formatNumber(tour.adults)}</TableCell>
                                      <TableCell className="text-center">{formatNumber(tour.children)}</TableCell>
                                      <TableCell className="text-center">{formatNumber(tour.total_pax)}</TableCell>
                                      <TableCell>{formatCurrency(tour.price)}</TableCell>
                                      <TableCell>
                                        {formatCurrency(tour.total_net || tour.price - (booking.commission || 0))}
                                      </TableCell>
                                      <TableCell>{displayValue(tour.tour_guide, "No Guide")}</TableCell>
                                      <TableCell>{displayValue(booking.payment_location)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>No tour details available for this booking.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Load More Button */}
      {hasMoreBookings && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadMore} variant="outline" className="bg-white hover:bg-gray-50">
            Load More...
          </Button>
        </div>
      )}

      {selectedBooking && (
        <DeleteBookingDialog
          bookingId={selectedBooking.id}
          bookingReference={selectedBooking.booking_reference}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          redirectPath="/dashboard/bookings"
        />
      )}
    </div>
  )
}

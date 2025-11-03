"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  Search,
  X,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import Link from "next/link"
import { fetchBookings, fetchBookingTours, deleteBookingAction } from "@/app/actions/dashboard-actions"
import DeleteBookingDialog from "./delete-booking-dialog"
import DownloadReceiptButton from "./download-receipt-button"
import SendBookingEmailButton from "./send-booking-email-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import ExportFilterModal from "./export-filter-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AllBookingsTable() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [bookingTours, setBookingTours] = useState<Record<string, any[]>>({})
  const [loadingTours, setLoadingTours] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<string>("tour_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const [exportModalOpen, setExportModalOpen] = useState(false)

  // Check if booking has multiple tours
  const hasMultipleTours = (booking: any): boolean => {
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
  const autoFetchMultiTourData = async (bookingsData: any[]) => {
    const multiTourBookings = bookingsData.filter(hasMultipleTours)

    if (multiTourBookings.length > 0) {
      // Fetch tour data for all multi-tour bookings
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
  }

  // Fetch bookings on component mount
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true)
      try {
        const data = await fetchBookings()
        // Sort bookings by tour_date in ascending order by default
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.tour_date || a.created_at || 0).getTime()
          const dateB = new Date(b.tour_date || b.created_at || 0).getTime()
          return dateA - dateB
        })
        setBookings(sortedData)
        setFilteredBookings(sortedData)

        // Auto-fetch tour data for multi-tour bookings
        await autoFetchMultiTourData(sortedData)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [])

  // Filter bookings when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = bookings.filter(
      (booking) =>
        booking.booking_reference?.toLowerCase().includes(term) ||
        booking.customer_name?.toLowerCase().includes(term) ||
        booking.email?.toLowerCase().includes(term) ||
        booking.phone?.toLowerCase().includes(term) ||
        booking.status?.toLowerCase().includes(term) ||
        booking.tour_name?.toLowerCase().includes(term),
    )

    setFilteredBookings(filtered)
  }, [searchTerm, bookings])

  const handleDeleteClick = (booking: any) => {
    setSelectedBooking(booking)
    setDeleteDialogOpen(true)
  }

  // Handle actual deletion with optimistic updates
  const handleDeleteBooking = async (bookingId: string) => {
    // Optimistically update UI
    const bookingToDelete = bookings.find((b) => b.id === bookingId)
    const updatedBookings = bookings.filter((b) => b.id !== bookingId)
    setBookings(updatedBookings)
    setFilteredBookings((prev) => prev.filter((b) => b.id !== bookingId))

    try {
      const result = await deleteBookingAction(bookingId)

      if (result.success) {
        toast({
          title: "Booking deleted",
          description: `Booking ${bookingToDelete?.booking_reference || bookingId} was deleted successfully.`,
        })
      } else {
        // Revert optimistic update on failure
        toast({
          title: "Error",
          description: result.message || "Failed to delete booking. Please try again.",
          variant: "destructive",
        })
        setBookings((prev) =>
          [...prev, bookingToDelete].sort((a, b) => {
            const dateA = new Date(a.tour_date || a.created_at || 0).getTime()
            const dateB = new Date(b.tour_date || b.created_at || 0).getTime()
            return dateA - dateB
          }),
        )
        setFilteredBookings((prev) => {
          const newFiltered = [...prev, bookingToDelete]
          if (searchTerm) {
            return newFiltered.filter(
              (booking) =>
                booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          }
          return newFiltered
        })
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      // Revert optimistic update on error
      setBookings((prev) =>
        [...prev, bookingToDelete].sort((a, b) => {
          const dateA = new Date(a.tour_date || a.created_at || 0).getTime()
          const dateB = new Date(b.tour_date || b.created_at || 0).getTime()
          return dateA - dateB
        }),
      )
      setFilteredBookings((prev) => {
        const newFiltered = [...prev, bookingToDelete]
        if (searchTerm) {
          return newFiltered.filter(
            (booking) =>
              booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              booking.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        }
        return newFiltered
      })
    }
  }

  // Get tours for a booking
  const getToursForBooking = (booking: any): any[] => {
    // If we have fetched tour data, use that
    if (bookingTours[booking.id]) {
      return bookingTours[booking.id]
    }

    // Otherwise use the tours array from the booking if available
    return booking.tours || []
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

  // Format currency for display
  const formatCurrency = (value: any): string => {
    const num = Number(value)
    return isNaN(num) ? "€0.00" : `€${num.toFixed(2)}`
  }

  // Format number for display
  const formatNumber = (value: any): string => {
    const num = Number(value)
    return isNaN(num) ? "0" : num.toString()
  }

  // Get actual tour count
  const getActualTourCount = (booking: any): number => {
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

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new sort column and default to ascending
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />
    }
    return sortOrder === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  // Display value with fallback
  const displayValue = (value: any, fallback = "-"): string => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    return value.toString()
  }

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let valueA = a[sortBy]
    let valueB = b[sortBy]

    // Handle numeric values
    if (typeof valueA === "string" && !isNaN(Number(valueA))) {
      valueA = Number(valueA)
      valueB = Number(valueB)
    }

    // Handle dates
    if (sortBy === "tour_date" || sortBy === "created_at") {
      valueA = new Date(valueA || 0).getTime()
      valueB = new Date(valueB || 0).getTime()
    }

    // Handle string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      if (sortOrder === "asc") {
        return valueA.localeCompare(valueB)
      } else {
        return valueB.localeCompare(valueA)
      }
    }

    // Handle numeric comparison
    if (sortOrder === "asc") {
      return (valueA || 0) - (valueB || 0)
    } else {
      return (valueB || 0) - (valueA || 0)
    }
  })

  // Export to Excel
  const openExportModal = () => {
    setExportModalOpen(true)
  }

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchBookings()
      // Sort bookings by tour_date in ascending order
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.tour_date || a.created_at || 0).getTime()
        const dateB = new Date(b.tour_date || b.created_at || 0).getTime()
        return dateA - dateB
      })
      setBookings(sortedData)
      setFilteredBookings(sortedData)

      // Auto-fetch tour data for multi-tour bookings after refresh
      await autoFetchMultiTourData(sortedData)
    } catch (error) {
      console.error("Error refreshing bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Sticky Controls Bar */}
      <div className="sticky top-0 z-30 bg-white border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-1 bg-transparent">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openExportModal}
            className="flex items-center gap-1 bg-[#6b0f1a] hover:bg-[#6b0f1a]/90 text-white border-[#6b0f1a]"
          >
            <Download size={14} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <style jsx>{`
.table-container {
  position: relative;
  overflow: auto;
  max-height: calc(100vh - 200px);
  width: 100%;
}

/* Ensure the table takes full width */
.full-width-table {
  width: 100%;
  min-width: 1500px; /* Ensure table is wide enough for all columns */
}
`}</style>

      <div className="table-container">
        <Table className="full-width-table">
          <TableHeader>
            <TableRow className="bg-red-900 hover:bg-red-800 border-red-800">
              <TableHead className="w-[50px] text-center font-bold bg-red-900 text-white border-r border-red-800 hover:bg-red-800 hover:text-white">
                #
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-red-800 hover:text-white whitespace-nowrap font-bold text-white"
                onClick={() => handleSort("tour_date")}
              >
                <div className="flex items-center">Tour Date {getSortIcon("tour_date")}</div>
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Ship
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Tour Name
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Customer
              </TableHead>
              <TableHead className="text-center whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Adults
              </TableHead>
              <TableHead className="text-center whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Children
              </TableHead>
              <TableHead className="text-center whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Tours
              </TableHead>
              <TableHead className="text-center whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Total Pax
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Deposit
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Remaining
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Total
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Status
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Email
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Commission
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Phone
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Payment Location
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Tour Guide
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Other
              </TableHead>
              <TableHead className="whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Total NET
              </TableHead>
              <TableHead className="text-right whitespace-nowrap font-bold text-white hover:bg-red-800 hover:text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={21} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No bookings match your search criteria." : "No bookings found."}
                </TableCell>
              </TableRow>
            ) : (
              sortedBookings.map((booking, index) => {
                const tourCount = getActualTourCount(booking)
                const hasMultiple = hasMultipleTours(booking)

                return (
                  <React.Fragment key={booking.id}>
                    <TableRow className={`${hasMultiple ? "bg-slate-50" : ""} `}>
                      <TableCell className="text-center font-bold bg-red-900 text-white border-r border-red-800 text-base">
                        {index + 1}
                      </TableCell>
                      <TableCell>{formatDate(booking.tour_date || booking.created_at)}</TableCell>
                      <TableCell>{displayValue(booking.ship_name)}</TableCell>
                      <TableCell>{displayValue(booking.tour_name)}</TableCell>
                      <TableCell>{displayValue(booking.customer_name, "Unknown Customer")}</TableCell>
                      <TableCell className="text-center">{formatNumber(booking.adults)}</TableCell>
                      <TableCell className="text-center">{formatNumber(booking.children)}</TableCell>
                      <TableCell className="text-center">{formatNumber(booking.tour_count || 0)}</TableCell>
                      <TableCell className="text-center">{formatNumber(booking.total_pax)}</TableCell>
                      <TableCell>{formatCurrency(booking.deposit)}</TableCell>
                      <TableCell>{formatCurrency(booking.remaining_balance)}</TableCell>
                      <TableCell>{formatCurrency(booking.total_payment)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status
                            ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                            : "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>{displayValue(booking.email)}</TableCell>
                      <TableCell>{formatCurrency(booking.commission)}</TableCell>
                      <TableCell>{displayValue(booking.phone)}</TableCell>
                      <TableCell>{displayValue(booking.payment_location)}</TableCell>
                      <TableCell>{displayValue(booking.tour_guide)}</TableCell>
                      <TableCell>{displayValue(booking.other)}</TableCell>
                      <TableCell>{formatCurrency(booking.total_net)}</TableCell>
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
                        <TableCell colSpan={21} className="p-0 border-t-0">
                          <div className="bg-slate-50 p-4">
                            <h4 className="font-medium mb-2">
                              Tours in this booking ({getToursForBooking(booking).length} tours)
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
                                      <TableHead className="font-bold">Tour Guide</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getToursForBooking(booking).map((tour, index) => (
                                      <TableRow key={tour.id}>
                                        <TableCell className="text-center font-bold bg-amber-50 border-r border-amber-100 text-amber-900">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell>{displayValue(tour.tour_name, "Unknown Tour")}</TableCell>
                                        <TableCell>{formatDate(tour.tour_date)}</TableCell>
                                        <TableCell>{displayValue(tour.ship_name)}</TableCell>
                                        <TableCell className="text-center">{formatNumber(tour.adults)}</TableCell>
                                        <TableCell className="text-center">{formatNumber(tour.children)}</TableCell>
                                        <TableCell className="text-center">{formatNumber(tour.total_pax)}</TableCell>
                                        <TableCell>{formatCurrency(tour.price)}</TableCell>
                                        <TableCell>{displayValue(tour.tour_guide, "No Guide")}</TableCell>
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
      </div>

      {selectedBooking && (
        <DeleteBookingDialog
          bookingId={selectedBooking.id}
          bookingReference={selectedBooking.booking_reference}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteBooking}
          redirectPath="/dashboard/bookings"
        />
      )}
      <ExportFilterModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
    </div>
  )
}

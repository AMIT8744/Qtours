"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

interface Booking {
  id: string
  booking_reference: string
  tour_date: string
  tour_name: string
  ship_name: string
  customer_name: string
  email: string
  phone: string
  status: string
  marketing_source?: string
  tour_guide?: string
}

interface BookingSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BookingSearchModal({ open, onOpenChange }: BookingSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Booking[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const mounted = useRef(false)

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Clear search when modal closes
      setSearchTerm("")
      setSearchResults([])
      setError(null)
    }
  }, [open])

  // Set mounted ref on component mount
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      // Clear any pending timeouts on unmount
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim() || !mounted.current) {
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/search?q=${encodeURIComponent(searchTerm)}`)

      // Check if component is still mounted before updating state
      if (!mounted.current) return

      if (!response.ok) {
        throw new Error(`Error searching bookings: ${response.statusText}`)
      }

      const data = await response.json()
      setSearchResults(data.bookings || [])
    } catch (err) {
      // Check if component is still mounted before updating state
      if (!mounted.current) return

      console.error("Error searching bookings:", err)
      setError("Failed to search bookings. Please try again.")
    } finally {
      // Check if component is still mounted before updating state
      if (mounted.current) {
        setIsSearching(false)
      }
    }
  }

  // Handle search term changes with debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    // Only search if term is at least 2 characters
    if (searchTerm.trim().length >= 2) {
      debounceTimeout.current = setTimeout(() => {
        if (mounted.current) {
          handleSearch()
        }
      }, 300) // 300ms debounce delay
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [searchTerm])

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No date"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"

      return format(date, "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Bookings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by booking reference, customer name, email, phone, tour guide, or marketing source"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={handleClearSearch} disabled={isSearching || !searchTerm}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : searchTerm ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only md:not-sr-only md:ml-2">{searchTerm ? "Clear" : "Search"}</span>
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              searchTerm.trim() && searchTerm.length >= 2 ? (
                <div className="text-center text-muted-foreground py-4">No bookings found</div>
              ) : null
            ) : (
              searchResults.map((booking) => (
                <Link
                  href={`/dashboard/bookings/${booking.id}`}
                  key={booking.id}
                  className="block border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{booking.booking_reference}</div>
                      <div className="text-sm text-muted-foreground">{booking.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.email}</div>
                      {booking.tour_guide && (
                        <div className="text-sm text-muted-foreground">Guide: {booking.tour_guide}</div>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end gap-1">
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
                        {booking.status}
                      </Badge>
                      <div className="text-sm">{formatDate(booking.tour_date)}</div>
                      <div className="text-sm text-muted-foreground">{booking.tour_name}</div>
                      {booking.marketing_source && (
                        <div className="text-xs text-muted-foreground">Source: {booking.marketing_source}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

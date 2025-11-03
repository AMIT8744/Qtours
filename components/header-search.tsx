"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, User, MapPin, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import ClickOutside from "@/components/click-outside"

interface SearchResult {
  id: string
  booking_reference: string
  tour_date: string
  tour_name: string
  ship_name: string
  customer_name: string
  email: string
  phone: string
  status: string
  tour_guide: string
  marketing_source: string
}

export default function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm)
      } else {
        setResults([])
        setShowResults(false)
        setError(null)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const performSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      console.log("Search results:", data)
      setResults(data.bookings || [])
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setError(error instanceof Error ? error.message : "Search failed")
      setResults([])
      setShowResults(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = (booking: SearchResult) => {
    router.push(`/dashboard/bookings/${booking.id}`)
    setShowResults(false)
    setSearchTerm("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ClickOutside onClickOutside={() => setShowResults(false)}>
      <div className="relative flex-1 max-w-sm mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b0f1a] focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-[#6b0f1a] border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
            {error ? (
              <div className="px-4 py-6 text-center text-red-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-red-300" />
                <p>Search Error</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {results.length} booking{results.length !== 1 ? "s" : ""} found
                </div>
                {results.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => handleResultClick(booking)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-[#6b0f1a]">{booking.booking_reference}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{booking.customer_name}</span>
                            {booking.phone && (
                              <>
                                <Phone className="h-3 w-3 text-gray-400 ml-2" />
                                <span>{booking.phone}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{booking.tour_name || "No tour assigned"}</span>
                            {booking.tour_guide && <span className="text-gray-500">• Guide: {booking.tour_guide}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{formatDate(booking.tour_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No bookings found for "{searchTerm}"</p>
                <div className="text-sm mt-2 text-gray-400">
                  <p>Try searching for:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Booking reference (e.g., "REF-")</li>
                    <li>• Customer name</li>
                    <li>• Tour name</li>
                    <li>• Phone number</li>
                    <li>• Email address</li>
                    <li>• Tour guide name</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ClickOutside>
  )
}

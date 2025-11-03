"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, Clock, Ship, Users } from "lucide-react"
import { searchTours } from "@/app/actions/search-tours-action"
import Link from "next/link"

interface Tour {
  id: number
  name: string
  description: string
  price: number
  status: string
  capacity: number
  duration: string
  ship_name: string
  location: string
  booking_count: number
}

export default function TourSearch() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Tour[]>([])
  const [showResults, setShowResults] = useState(false)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsContainerRef.current &&
        !resultsContainerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length === 0) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await searchTours(query)
        setSearchResults(results)
        setShowResults(true)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="relative w-[200px] md:w-[300px]">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tours..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          className="pl-8"
        />
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {isSearching && (
        <div className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-1 z-50 border">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        </div>
      )}

      {showResults && searchResults.length > 0 && (
        <div
          ref={resultsContainerRef}
          className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-1 z-50 max-h-[400px] overflow-y-auto border"
        >
          {searchResults.map((tour) => (
            <Link
              href={`/dashboard/tours/${tour.id}`}
              key={tour.id}
              className="block hover:bg-gray-50 transition-colors"
              onClick={() => {
                setShowResults(false)
                setQuery("")
              }}
            >
              <div className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{tour.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{tour.description}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="truncate">{tour.location || "Various Locations"}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{tour.duration || "4 hours"}</span>
                        </div>

                        {tour.ship_name && (
                          <div className="flex items-center">
                            <Ship className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate">{tour.ship_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-gray-600">
                        <Users className="h-3 w-3 mr-1 text-gray-400" />
                        <span>
                          Capacity: {tour.capacity || "N/A"} ({tour.booking_count || 0} booked)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-3 flex flex-col items-end">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tour.status === "active"
                          ? "bg-green-100 text-green-800"
                          : tour.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tour.status || "active"}
                    </span>

                    <div className="mt-1 font-semibold text-sm text-gray-900">
                      {tour.price ? formatPrice(tour.price) : "Price on request"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showResults && searchResults.length === 0 && query.trim().length > 0 && !isSearching && (
        <div className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-1 z-50 border">
          <div className="p-4 text-center text-sm text-gray-500">No tours found matching "{query}"</div>
        </div>
      )}
    </div>
  )
}

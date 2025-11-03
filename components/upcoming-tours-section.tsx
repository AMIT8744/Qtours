"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Users } from "lucide-react"
import Link from "next/link"
import { format, startOfDay, endOfDay, addDays, isWithinInterval } from "date-fns"

interface Tour {
  id: string
  booking_reference: string
  tour_date: string
  tour_name: string
  ship_name: string
  customer_name: string
  adults: number
  children: number
  total_pax: number
  location: string
  status: string
  tour_guide?: string
  payment_location?: string
  marketing_source?: string
}

export function UpcomingToursSection() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("today")
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true)
        setError(null)

        // For "today" tab, use 0 days to only get today's bookings
        const days = activeTab === "today" ? "0" : activeTab === "week" ? "7" : "30"
        // Add a cache-busting parameter to ensure fresh data
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/bookings/upcoming?days=${days}&_=${timestamp}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          throw new Error(`Error fetching tours: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("API Response:", data)

        // Handle error responses
        if (data.error) {
          throw new Error(data.error)
        }

        // Check if data has the expected structure
        if (!data || (!Array.isArray(data.bookings) && !Array.isArray(data.tours))) {
          console.error("Unexpected API response format:", data)
          setTours([])
          setError("Received invalid data format from the server")
          return
        }

        // Use bookings data if available, otherwise use tours data
        const toursData = data.bookings || data.tours || []
        console.log(`Setting ${toursData.length} tours`)
        setTours(toursData)
      } catch (err) {
        console.error("Error fetching upcoming tours:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
        setError(`Failed to load upcoming tours: ${errorMessage}`)
        setTours([])
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [activeTab])

  // Filter tours based on the active tab
  useEffect(() => {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekEnd = endOfDay(addDays(now, 7))
    const monthEnd = endOfDay(addDays(now, 30))

    const filtered = tours.filter((tour) => {
      try {
        // Skip invalid dates
        if (!tour.tour_date) return false

        const tourDate = new Date(tour.tour_date)

        // Skip invalid date objects
        if (isNaN(tourDate.getTime())) return false

        if (activeTab === "today") {
          // Check if the tour date is today
          return isWithinInterval(tourDate, { start: todayStart, end: todayEnd })
        } else if (activeTab === "week") {
          // Check if the tour date is within the next 7 days
          return isWithinInterval(tourDate, { start: todayStart, end: weekEnd })
        } else {
          // Check if the tour date is within the next 30 days
          return isWithinInterval(tourDate, { start: todayStart, end: monthEnd })
        }
      } catch (error) {
        console.error("Error filtering tour date:", error, tour)
        return false
      }
    })

    console.log(`Filtered ${filtered.length} tours for ${activeTab}`)
    setFilteredTours(filtered)
  }, [tours, activeTab])

  // Group tours by date
  const groupedTours = filteredTours.reduce((acc: Record<string, Tour[]>, tour) => {
    try {
      // Check if tour_date is valid before formatting
      if (!tour.tour_date) {
        if (!acc["Invalid Date"]) {
          acc["Invalid Date"] = []
        }
        acc["Invalid Date"].push(tour)
        return acc
      }

      // Format the date as a string for grouping
      const dateKey = format(new Date(tour.tour_date), "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(tour)
    } catch (error) {
      console.error("Error formatting date:", error, tour)
      // If date is invalid, group under "Invalid Date"
      if (!acc["Invalid Date"]) {
        acc["Invalid Date"] = []
      }
      acc["Invalid Date"].push(tour)
    }
    return acc
  }, {})

  // Sort dates
  const sortedDates = Object.keys(groupedTours).sort()

  // Get card background and border colors based on active tab
  const getCardStyles = () => {
    switch (activeTab) {
      case "today":
        return {
          background: "bg-green-50",
          border: "border-green-200",
          hover: "hover:bg-green-100",
        }
      case "week":
        return {
          background: "bg-amber-50",
          border: "border-amber-200",
          hover: "hover:bg-amber-100",
        }
      case "month":
        return {
          background: "bg-blue-50",
          border: "border-blue-200",
          hover: "hover:bg-blue-100",
        }
      default:
        return {
          background: "",
          border: "border",
          hover: "hover:bg-slate-50",
        }
    }
  }

  const cardStyles = getCardStyles()

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b0f1a]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 text-sm underline hover:no-underline">
                Try refreshing the page
              </button>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No upcoming tours {activeTab === "today" ? "today" : activeTab === "week" ? "this week" : "this month"}.
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {dateKey === "Invalid Date" ? "Date Not Set" : format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="space-y-2">
                  {groupedTours[dateKey].map((tour) => (
                    <Link
                      href={`/dashboard/bookings/${tour.id}`}
                      key={tour.id}
                      className={`block rounded-lg p-3 transition-colors ${cardStyles.background} ${cardStyles.border} ${cardStyles.hover}`}
                    >
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{tour.tour_name || "Unnamed Tour"}</div>
                          <div className="text-sm text-muted-foreground">
                            {tour.ship_name || "No Ship"} - {tour.location || "No Location"}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3" />
                            <span>
                              {tour.total_pax || 0} passengers ({tour.adults || 0} adults, {tour.children || 0}{" "}
                              children)
                            </span>
                          </div>
                          {tour.tour_guide && tour.tour_guide !== "No Guide" && (
                            <div className="text-sm text-muted-foreground">Guide: {tour.tour_guide}</div>
                          )}
                        </div>
                        <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end gap-1">
                          <Badge
                            variant={
                              tour.status === "confirmed" ? "outline" : tour.status === "paid" ? "default" : "secondary"
                            }
                            className={
                              tour.status === "confirmed"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : tour.status === "paid"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {tour.status || "pending"}
                          </Badge>
                          <div className="text-sm">{tour.booking_reference || "No Reference"}</div>
                          <div className="text-sm text-muted-foreground">{tour.customer_name || "No Customer"}</div>
                          {tour.marketing_source && (
                            <div className="text-xs text-muted-foreground">Source: {tour.marketing_source}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

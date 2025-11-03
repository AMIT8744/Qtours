"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { exportFilteredBookings } from "@/app/actions/export-actions"
import { debugServerDate } from "@/app/actions/debug-date-actions"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { getAllTours } from "@/app/actions/tour-actions"

interface ExportFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FilterType = "today" | "week" | "month" | "all" | "tours" | "custom"

export default function ExportFilterModal({ open, onOpenChange }: ExportFilterModalProps) {
  const [filterType, setFilterType] = useState<FilterType>("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const [tours, setTours] = useState<any[]>([])
  const [selectedTours, setSelectedTours] = useState<string[]>([])
  const [isCheckingTours, setIsCheckingTours] = useState(false)
  const [tourBookingCounts, setTourBookingCounts] = useState<Record<string, number>>({})
  const [isLoadingCounts, setIsLoadingCounts] = useState(false)
  const [serverCurrentDate, setServerCurrentDate] = useState<string>("")

  // Fetch server's current date when component mounts
  useEffect(() => {
    const fetchServerDate = async () => {
      try {
        const result = await debugServerDate()
        if (result.success && result.serverDates?.formatted_current_date) {
          setServerCurrentDate(result.serverDates.formatted_current_date)
          console.log(`[CLIENT] Server current date: ${result.serverDates.formatted_current_date}`)
        }
      } catch (error) {
        console.error("Error fetching server date:", error)
        // Fallback to client date if server date fails
        const fallbackDate = new Date().toISOString().split("T")[0]
        setServerCurrentDate(fallbackDate)
      }
    }
    fetchServerDate()
  }, [])

  // Fetch tours when component mounts (but not booking counts)
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursData = await getAllTours()
        setTours(toursData)
      } catch (error) {
        console.error("Error fetching tours:", error)
      }
    }
    fetchTours()
  }, [])

  // Fetch booking counts only when "Tours" filter is selected
  useEffect(() => {
    if (filterType === "tours" && tours.length > 0 && Object.keys(tourBookingCounts).length === 0) {
      fetchTourBookingCounts()
    }
  }, [filterType, tours])

  // Reset selected tours and counts when switching away from "Tours" filter
  useEffect(() => {
    if (filterType !== "tours") {
      setSelectedTours([])
      setTourBookingCounts({})
    }
  }, [filterType])

  // Calculate date ranges using server's current date
  const getDateRange = (type: FilterType): { start: string; end: string } => {
    // Use server's current date if available, otherwise fallback to client date
    const currentDateStr = serverCurrentDate || new Date().toISOString().split("T")[0]
    const currentDate = new Date(currentDateStr + "T00:00:00.000Z") // Force UTC

    console.log(`[CLIENT] Using date: ${currentDateStr} for filter type: ${type}`)

    switch (type) {
      case "today":
        return {
          start: currentDateStr,
          end: currentDateStr,
        }

      case "week":
        // Get start and end of current week (Sunday to Saturday) using server date
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // 0 = Sunday
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

        return {
          start: format(weekStart, "yyyy-MM-dd"),
          end: format(weekEnd, "yyyy-MM-dd"),
        }

      case "month":
        // Get start and end of current month using server date
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)

        return {
          start: format(monthStart, "yyyy-MM-dd"),
          end: format(monthEnd, "yyyy-MM-dd"),
        }
      case "all":
        // Return a very wide date range to capture all data
        return {
          start: "1900-01-01", // Very early date
          end: "2099-12-31", // Very future date
        }

      case "custom":
        // Return exactly what user selected - already in YYYY-MM-DD format from date input
        return {
          start: startDate,
          end: endDate,
        }

      default:
        return {
          start: currentDateStr,
          end: currentDateStr,
        }
    }
  }

  const handleTourSelection = (tourId: string, checked: boolean) => {
    const bookingCount = tourBookingCounts[tourId] || 0

    // Prevent selection of tours with no bookings
    if (bookingCount === 0) {
      return
    }

    if (checked) {
      setSelectedTours((prev) => [...prev, tourId])
    } else {
      setSelectedTours((prev) => prev.filter((id) => id !== tourId))
    }
  }

  const checkToursHaveBookings = async (tourIds: string[]) => {
    setIsCheckingTours(true)
    try {
      const result = await exportFilteredBookings({
        startDate: "",
        endDate: "",
        tourIds: tourIds,
        checkOnly: true, // New parameter to only check if bookings exist
      })
      return result.recordCount > 0
    } catch (error) {
      console.error("Error checking tours:", error)
      return false
    } finally {
      setIsCheckingTours(false)
    }
  }

  const fetchTourBookingCounts = async () => {
    setIsLoadingCounts(true)
    try {
      console.log("[CLIENT] Fetching booking counts for tours...")
      const counts: Record<string, number> = {}

      // Fetch booking count for each tour
      for (const tour of tours) {
        try {
          const result = await exportFilteredBookings({
            startDate: "",
            endDate: "",
            tourIds: [tour.id.toString()],
            checkOnly: true,
          })
          counts[tour.id.toString()] = result.recordCount || 0
          console.log(`[CLIENT] Tour "${tour.name}" has ${result.recordCount || 0} bookings`)
        } catch (error) {
          console.error(`Error fetching count for tour ${tour.id}:`, error)
          counts[tour.id.toString()] = 0
        }
      }

      setTourBookingCounts(counts)
      console.log("[CLIENT] Finished fetching all tour booking counts:", counts)
    } catch (error) {
      console.error("Error fetching tour booking counts:", error)
    } finally {
      setIsLoadingCounts(false)
    }
  }

  const handleFilterTypeChange = (value: FilterType) => {
    setFilterType(value)

    // If switching to tours and we don't have counts yet, they will be fetched by useEffect
    // If switching away from tours, the useEffect will clear the data
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Handle tours filter
      if (filterType === "tours") {
        if (selectedTours.length === 0) {
          toast({
            title: "No Tours Selected",
            description: "Please select at least one tour to export.",
            variant: "destructive",
          })
          setIsExporting(false)
          return
        }

        // Check if selected tours have any bookings
        const hasBookings = await checkToursHaveBookings(selectedTours)
        if (!hasBookings) {
          const selectedTourNames = tours
            .filter((tour) => selectedTours.includes(tour.id.toString()))
            .map((tour) => tour.name)
            .join(", ")

          toast({
            title: "No Bookings Found",
            description: `The selected tour(s) "${selectedTourNames}" currently have no bookings to export. Please select tours with existing bookings.`,
            variant: "destructive",
          })
          setIsExporting(false)
          return
        }

        console.log(`[CLIENT] Requesting export for selected tours: ${selectedTours.join(", ")}`)

        const result = await exportFilteredBookings({
          startDate: "",
          endDate: "",
          tourIds: selectedTours,
        })

        console.log("[CLIENT] Export result:", result)

        if (result.success && result.data) {
          // Convert base64 to blob and trigger download
          const binaryString = atob(result.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })

          // Create download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url

          const selectedTourNames = tours
            .filter((tour) => selectedTours.includes(tour.id.toString()))
            .map((tour) => tour.name)
            .join("_")
            .replace(/[^a-zA-Z0-9_]/g, "") // Remove special characters

          link.download = `bookings_export_tours_${selectedTourNames.substring(0, 50)}_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`

          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          toast({
            title: "Export Successful",
            description: `Exported ${result.recordCount || 0} booking records for ${selectedTours.length} selected tour${selectedTours.length !== 1 ? "s" : ""}, ordered chronologically by tour date.`,
          })

          onOpenChange(false)
        } else {
          const errorMessage = result.message || "Failed to export bookings for selected tours. Please try again."
          toast({
            title: "Export Failed",
            description: errorMessage,
            variant: "destructive",
          })
          console.log("[CLIENT] Tours export failed - no download triggered")
        }
        setIsExporting(false)
        return
      }

      // Handle date-based filters (existing logic)
      const dateRange = getDateRange(filterType)

      console.log(
        `[CLIENT] Using server-based date range: ${dateRange.start} to ${dateRange.end} (Filter: ${filterType})`,
      )

      // Validate date range
      if (!dateRange.start || !dateRange.end) {
        toast({
          title: "Invalid Date Range",
          description: "Please select valid dates for the export range.",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      // Validate custom date range
      if (filterType === "custom") {
        if (!startDate || !endDate) {
          toast({
            title: "Invalid Date Range",
            description: "Please select both start and end dates for custom range.",
            variant: "destructive",
          })
          setIsExporting(false)
          return
        }

        if (new Date(startDate) > new Date(endDate)) {
          toast({
            title: "Invalid Date Range",
            description: "Start date must be before or equal to end date.",
            variant: "destructive",
          })
          setIsExporting(false)
          return
        }
      }

      console.log(`[CLIENT] Requesting export for date range: ${dateRange.start} to ${dateRange.end}`)

      const result = await exportFilteredBookings({
        startDate: dateRange.start,
        endDate: dateRange.end,
      })

      console.log("[CLIENT] Export result:", result)

      if (result.success && result.data) {
        // Convert base64 to blob and trigger download
        const binaryString = atob(result.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url

        // Generate descriptive filename
        const filterDescription = filterType === "custom" ? `${dateRange.start}_to_${dateRange.end}` : filterType

        link.download = `bookings_export_${filterDescription}_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: `Exported ${result.recordCount || 0} booking records successfully (${getFilterDisplayName()}).`,
        })

        onOpenChange(false)
      } else {
        // Show specific error message for no bookings found
        const errorMessage = result.message || "Failed to export bookings. Please try again."

        toast({
          title: "Export Failed",
          description: errorMessage,
          variant: "destructive",
        })

        // Don't trigger download if no bookings found or filter error
        console.log("[CLIENT] Export failed - no download triggered")
      }
    } catch (error) {
      console.error("[CLIENT] Export error:", error)
      toast({
        title: "Export Error",
        description: "An unexpected error occurred during export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFilterDescription = () => {
    if (filterType === "tours") {
      if (selectedTours.length === 0) {
        return "No tours selected"
      }
      const selectedTourNames = tours
        .filter((tour) => selectedTours.includes(tour.id.toString()))
        .map((tour) => tour.name)
      return `Selected tours: ${selectedTourNames.join(", ")}`
    }

    const dateRange = getDateRange(filterType)
    if (!dateRange.start || !dateRange.end) {
      return "Invalid date range"
    }
    return `${dateRange.start} to ${dateRange.end}`
  }

  const getFilterDisplayName = () => {
    switch (filterType) {
      case "today":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "all":
        return "All Bookings"
      case "tours":
        return "Selected Tours"
      case "custom":
        return "Custom Date Range"
      default:
        return "Unknown"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Bookings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filter-type">Export Time Range</Label>
            <Select value={filterType} onValueChange={handleFilterTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="tours">Tours</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {serverCurrentDate && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">Server Date: {serverCurrentDate}</div>
          )}

          {filterType === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="relative">
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="relative">
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {filterType === "tours" && (
            <div className="space-y-2">
              <Label>Select Tours</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {tours.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading tours...</p>
                ) : isLoadingCounts ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading booking counts...
                  </div>
                ) : Object.keys(tourBookingCounts).length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching tour booking data...
                  </div>
                ) : (
                  tours.map((tour) => {
                    const bookingCount = tourBookingCounts[tour.id.toString()] || 0
                    const isDisabled = bookingCount === 0

                    return (
                      <div
                        key={tour.id}
                        className={`flex items-center space-x-2 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          id={`tour-${tour.id}`}
                          checked={selectedTours.includes(tour.id.toString())}
                          onChange={(e) => handleTourSelection(tour.id.toString(), e.target.checked)}
                          disabled={isDisabled}
                          className={`rounded border-gray-300 ${isDisabled ? "cursor-not-allowed" : ""}`}
                        />
                        <label
                          htmlFor={`tour-${tour.id}`}
                          className={`text-sm font-medium ${isDisabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer"}`}
                        >
                          {tour.name} ({bookingCount} Booking{bookingCount !== 1 ? "s" : ""})
                        </label>
                      </div>
                    )
                  })
                )}
              </div>
              {selectedTours.length > 0 && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-600">
                    {selectedTours.length} tour{selectedTours.length !== 1 ? "s" : ""} selected
                  </p>
                  {isCheckingTours && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking bookings...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Export Range:</strong> {getFilterDescription()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {filterType === "tours"
                ? `This will export all bookings that include any of the selected tours, ordered chronologically by tour date. Only tours with existing bookings will be exported.`
                : `This will export only bookings with tour dates within the selected range (${getFilterDisplayName()}), including multi-tour bookings with detailed tour information. Results will be ordered by tour date. Select "All" to export all bookings regardless of date.`}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting || isCheckingTours}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              isExporting ||
              isCheckingTours ||
              isLoadingCounts ||
              (filterType === "tours" && selectedTours.length === 0)
            }
            className="bg-[#6b0f1a] hover:bg-[#6b0f1a]/90 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : isCheckingTours ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : isLoadingCounts ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X } from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TourDatePickerProps {
  selectedDates: string[]
  onDatesChange: (dates: string[]) => void
}

export default function TourDatePicker({ selectedDates, onDatesChange }: TourDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Helper function to safely convert string to Date
  const safeStringToDate = (dateString: string): Date | null => {
    try {
      if (!dateString) return null
      const date = parseISO(dateString)
      return isValid(date) ? date : null
    } catch (error) {
      console.error("Error parsing date:", dateString, error)
      return null
    }
  }

  // Helper function to safely convert Date to string
  const safeDateToString = (date: Date): string => {
    try {
      return format(date, "yyyy-MM-dd")
    } catch (error) {
      console.error("Error formatting date:", date, error)
      return ""
    }
  }

  // Convert string dates to Date objects for the calendar, filtering out invalid dates
  const selectedDateObjects = selectedDates.map(safeStringToDate).filter((date): date is Date => date !== null)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const dateString = safeDateToString(date)
    if (!dateString) return

    if (selectedDates.includes(dateString)) {
      // Remove date if already selected
      onDatesChange(selectedDates.filter((d) => d !== dateString))
    } else {
      // Add date if not selected
      const newDates = [...selectedDates, dateString]
      // Sort dates chronologically
      newDates.sort((a, b) => {
        try {
          const dateA = new Date(a)
          const dateB = new Date(b)
          return dateA.getTime() - dateB.getTime()
        } catch (error) {
          console.error("Error sorting dates:", error)
          return 0
        }
      })
      onDatesChange(newDates)
    }
  }

  const removeDate = (dateToRemove: string) => {
    onDatesChange(selectedDates.filter((date) => date !== dateToRemove))
  }

  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = safeStringToDate(dateString)
      return date ? format(date, "MMM dd, yyyy") : dateString
    } catch (error) {
      console.error("Error formatting display date:", dateString, error)
      return dateString
    }
  }

  return (
    <div className="space-y-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDates.length > 0
              ? `${selectedDates.length} date${selectedDates.length > 1 ? "s" : ""} selected`
              : "Select available dates"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="multiple"
            selected={selectedDateObjects}
            onSelect={(dates) => {
              if (dates) {
                const dateStrings = Array.from(dates)
                  .map(safeDateToString)
                  .filter((dateString) => dateString !== "")
                  .sort()
                onDatesChange(dateStrings)
              }
            }}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {selectedDates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Dates:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date) => (
              <Badge key={date} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                {formatDisplayDate(date)}
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

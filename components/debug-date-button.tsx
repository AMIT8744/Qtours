"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { debugServerDate } from "@/app/actions/debug-date-actions"
import { Calendar } from "lucide-react"

export default function DebugDateButton() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDebug = async () => {
    setIsChecking(true)
    try {
      const debugResult = await debugServerDate()
      setResult(debugResult)
      console.log("Debug date result:", debugResult)
    } catch (error) {
      console.error("Debug error:", error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleDebug}
        disabled={isChecking}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        {isChecking ? "Checking..." : "Debug Server Date"}
      </Button>

      {result && (
        <div className="bg-gray-50 p-4 rounded-md text-sm">
          <h4 className="font-semibold mb-2">Server Date Debug:</h4>
          {result.success ? (
            <div className="space-y-2">
              <div>
                <strong>Server Current Date:</strong> {result.serverDates.server_current_date}
              </div>
              <div>
                <strong>Formatted:</strong> {result.serverDates.formatted_current_date}
              </div>
              <div>
                <strong>Server Timestamp:</strong> {result.serverDates.server_current_timestamp}
              </div>

              <div className="mt-4">
                <strong>Recent Tour Dates:</strong>
                <ul className="list-disc list-inside">
                  {result.tourDates.map((tour: any, index: number) => (
                    <li key={index}>
                      {tour.tour_date_formatted} ({tour.booking_count} bookings)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-red-600">Error: {result.error}</div>
          )}
        </div>
      )}
    </div>
  )
}

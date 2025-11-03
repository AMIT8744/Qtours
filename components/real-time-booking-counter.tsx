"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function RealTimeBookingCounter() {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial fetch to get the current count
    const fetchInitialCount = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/bookings/count")
        if (response.ok) {
          const data = await response.json()
          setCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching booking count:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialCount()

    // Set up event source for real-time updates
    const setupEventSource = () => {
      try {
        const eventSource = new EventSource("/api/bookings/events")

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "booking_created") {
              setCount((prevCount) => prevCount + 1)
            }
          } catch (error) {
            console.error("Error parsing event data:", error)
          }
        }

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error)
          eventSource.close()
          // Try to reconnect after a delay
          setTimeout(setupEventSource, 5000)
        }

        return eventSource
      } catch (error) {
        console.error("Error setting up EventSource:", error)
        return null
      }
    }

    // For demo purposes, simulate real-time updates
    const simulateRealTimeUpdates = () => {
      const interval = setInterval(() => {
        // Randomly decide whether to increment (20% chance)
        if (Math.random() < 0.2) {
          setCount((prevCount) => prevCount + 1)
        }
      }, 10000) // Check every 10 seconds

      return interval
    }

    // In a real environment, use the event source
    // const eventSource = setupEventSource()

    // For demo, use the simulation
    const interval = simulateRealTimeUpdates()

    return () => {
      // In a real environment:
      // if (eventSource) eventSource.close()

      // For demo:
      clearInterval(interval)
    }
  }, [])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Real-Time Bookings</span>
          </div>
          <div className="text-3xl font-bold">
            {isLoading ? <div className="h-9 w-16 animate-pulse rounded bg-muted"></div> : count}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getAllTours } from "@/app/actions/tour-actions"
import { getAllShips } from "@/app/actions/ship-actions"
import { getAllLocations } from "@/app/actions/location-actions"
import { getAllAgents } from "@/app/actions/agent-actions"
import { AddBookingForm } from "./add-booking-form"
import { getBookingAgents } from "@/app/actions/booking-agent-actions"

// Force fresh data on every request
export const dynamic = "force-dynamic"

export default async function NewBookingPage() {
  console.log("NEW BOOKING PAGE: Loading data...")

  try {
    // Force fresh data fetch with error handling - including booking agents
    const [tours, ships, locations, agents, bookingAgents] = await Promise.all([
      getAllTours().catch((err) => {
        console.error("Error loading tours:", err)
        return []
      }),
      getAllShips().catch((err) => {
        console.error("Error loading ships:", err)
        return []
      }),
      getAllLocations().catch((err) => {
        console.error("Error loading locations:", err)
        return []
      }),
      getAllAgents().catch((err) => {
        console.error("Error loading agents:", err)
        return []
      }),
      getBookingAgents().catch((err) => {
        console.error("Error loading booking agents:", err)
        return []
      }),
    ])

    console.log("NEW BOOKING PAGE: Data loaded successfully")
    console.log("NEW BOOKING PAGE: Tours:", tours?.length || 0)
    console.log("NEW BOOKING PAGE: Ships:", ships?.length || 0)
    console.log("NEW BOOKING PAGE: Locations:", locations?.length || 0)
    console.log("NEW BOOKING PAGE: Agents:", agents?.length || 0)
    console.log("NEW BOOKING PAGE: Booking Agents:", bookingAgents?.length || 0)
    console.log("NEW BOOKING PAGE: Booking Agents data:", bookingAgents)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
          <Link href="/dashboard/bookings">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
        <AddBookingForm
          tours={tours || []}
          ships={ships || []}
          locations={locations || []}
          agents={agents || []}
          bookingAgents={bookingAgents || []} // Pass booking agents to form
        />
      </div>
    )
  } catch (error) {
    console.error("NEW BOOKING PAGE: Error loading page data:", error)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
          <Link href="/dashboard/bookings">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading booking form data. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    )
  }
}

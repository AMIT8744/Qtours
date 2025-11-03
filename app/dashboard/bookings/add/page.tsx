import { getAllTours } from "@/app/actions/tour-actions"
import { getAllShips } from "@/app/actions/ship-actions"
import { getAllLocations } from "@/app/actions/location-actions"
import { getAllAgents } from "@/app/actions/agent-actions"
import { AddBookingForm } from "@/components/forms/add-booking-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getBookingAgents } from "@/app/actions/booking-agent-actions"

export default async function AddBookingPage() {
  const [tours, ships, locations, agents, bookingAgents] = await Promise.all([
    getAllTours(),
    getAllShips(),
    getAllLocations(),
    getAllAgents(),
    getBookingAgents(),
  ])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Add New Booking</h1>
        <Link href="/dashboard/bookings">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      <AddBookingForm
        tours={tours}
        ships={ships}
        locations={locations}
        agents={[...agents, ...bookingAgents.map((a) => ({ id: a.id, name: a.name }))]}
      />
    </div>
  )
}

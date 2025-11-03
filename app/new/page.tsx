export const dynamic = "force-dynamic"

import { getAgents, getLocations, getShips, getTours } from "@/app/actions/tour-actions"
import { getBookingAgents } from "@/app/actions/booking-agent-actions"
import { getSession } from "@/app/actions/auth-actions"
import AddBookingForm from "@/components/add-booking-form"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Add New Booking | Viaggi Del Qatar",
  description: "Create a new tour booking in the system",
}

export default async function AddBookingPage() {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Page Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Plus className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Create New Booking</h1>
                <p className="text-lg text-gray-600 mt-3">
                  Add a new tour booking to the system with customer details, tour selections, and payment information
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <Suspense fallback={<BookingFormSkeleton />}>
            <BookingFormWrapper />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

async function BookingFormWrapper() {
  // Fetch data needed for the form - including booking agents
  const [tours, ships, locations, agents, bookingAgents] = await Promise.all([
    getTours(),
    getShips(),
    getLocations(),
    getAgents(),
    getBookingAgents(), // Add booking agents to server-side fetch
  ])

  console.log("NEW PAGE: Booking agents fetched:", bookingAgents?.length || 0)

  return (
    <AddBookingForm
      tours={tours}
      ships={ships}
      locations={locations}
      agents={agents}
      bookingAgents={bookingAgents || []} // Pass booking agents to form
      deductCommissionFromRemaining={true} // Add this new prop
    />
  )
}

function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = "force-dynamic"

import { getAgents, getLocations, getShips, getTours } from "@/app/actions/tour-actions"
import { getSession } from "@/app/actions/auth-actions"
import AddBookingForm from "@/components/add-booking-form"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Booking</h1>
            <p className="text-muted-foreground">Create a new tour booking in the system</p>
          </div>

          <Suspense fallback={<BookingFormSkeleton />}>
            <BookingFormWrapper />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

async function BookingFormWrapper() {
  // Fetch data needed for the form
  const [tours, ships, locations, agents] = await Promise.all([getTours(), getShips(), getLocations(), getAgents()])

  return <AddBookingForm tours={tours} ships={ships} locations={locations} agents={agents} />
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

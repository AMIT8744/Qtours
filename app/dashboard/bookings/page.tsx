import { Suspense } from "react"
import AllBookingsTable from "@/components/all-bookings-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getBookings } from "@/app/actions/booking-actions"
import { getSession } from "@/app/actions/auth-actions"
import { redirect } from "next/navigation"
import { DashboardTabs } from "../dashboard-tabs"

// Disable caching for this page
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Bookings Management | Viaggi Del Qatar",
  description: "Manage all bookings in the system",
}

export default async function BookingsPage() {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch all bookings
  const bookings = await getBookings()
  console.log(`Rendering bookings page with ${bookings.length} bookings`)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
              <p className="text-muted-foreground">Manage all bookings in the system</p>
            </div>
            <div className="flex gap-2">
              <Link href="/new">
                <Button className="bg-[#6b0f1a] hover:bg-[#6b0f1a]/90 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add New Booking
                </Button>
              </Link>
            </div>
          </div>

          <DashboardTabs />

          <div className="mt-4">
            <Suspense fallback={<div>Loading bookings...</div>}>
              <AllBookingsTable />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

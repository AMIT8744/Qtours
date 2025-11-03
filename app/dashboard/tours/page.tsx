export const dynamic = "force-dynamic"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getTours } from "@/app/actions/tour-actions"
import { getSession } from "@/app/actions/auth-actions"
import { redirect } from "next/navigation"
import TourCard from "@/components/tour-card"
import { getUnreadNotificationsCount } from "@/app/actions/notification-actions"
import TourSearch from "@/components/tour-search"

export const metadata = {
  title: "Tours Management | Viaggi Del Qatar",
  description: "Manage all available tours in the system",
}

export default async function ToursPage() {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch all tours
  const tours = await getTours()
  const unreadNotificationsCount = await getUnreadNotificationsCount(session.id)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tours</h1>
              <p className="text-muted-foreground">Manage all available tours in the system</p>
            </div>
            <div className="flex gap-2">
              <TourSearch />
              <Link href="/dashboard/tours/add">
                <Button className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                  <Plus className="mr-2 h-4 w-4" /> Add Tour
                </Button>
              </Link>
            </div>
          </div>

          <div id="tour-results" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No tours found. Create your first tour to see it here.
              </div>
            ) : (
              tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  id={tour.id}
                  name={tour.name}
                  shipName={tour.ship_name}
                  duration={tour.duration}
                  price={tour.price}
                  location={tour.location}
                  capacity={tour.capacity}
                  bookingCount={Number.parseInt(tour.booking_count) || 0}
                  status={tour.status}
                  description={tour.description}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

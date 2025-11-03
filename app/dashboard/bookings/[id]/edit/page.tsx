import { fetchBookingById } from "@/app/actions/dashboard-actions"
import { getTours } from "@/app/actions/tour-actions"
import { getShips } from "@/app/actions/ship-actions"
import { getBookingAgents } from "@/app/actions/agent-display-actions"
import { getSession } from "@/app/actions/auth-actions"
import EditBookingForm from "@/components/edit-booking-form"
import { redirect } from "next/navigation"
import { getUnreadNotificationsCount } from "@/app/actions/notification-actions"

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch booking details
  const booking = await fetchBookingById(params.id)
  if (!booking) {
    console.error(`Booking with ID ${params.id} not found`)
    redirect("/dashboard/bookings")
  }

  console.log("Fetched booking data:", booking)

  // Fetch data needed for the form
  const [tours, ships, bookingAgents] = await Promise.all([getTours(), getShips(), getBookingAgents()])

  const unreadNotificationsCount = await getUnreadNotificationsCount(session.id)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
            <p className="text-muted-foreground">
              Booking Reference: {booking.booking_reference} | Customer: {booking.customer_name}
            </p>
          </div>

          <EditBookingForm booking={booking} tours={tours} ships={ships} bookingAgents={bookingAgents} />
        </div>
      </main>
    </div>
  )
}

import { fetchBookingById } from "@/app/actions/dashboard-actions"
import { getSession } from "@/app/actions/auth-actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CreditCard, Edit, FileText, Ship, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import DeleteBookingButton from "@/components/delete-booking-button"
import DownloadReceiptButton from "@/components/download-receipt-button"
import { executeQuery } from "@/lib/db"

// Helper function to safely format dates
function safeFormatDate(dateString: string | null | undefined, formatStr = "PPP"): string {
  if (!dateString) return "N/A"

  try {
    // First check if it's a valid date string
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"

    // If it's ISO format, use parseISO for better handling
    if (typeof dateString === "string" && dateString.includes("T")) {
      return format(parseISO(dateString), formatStr)
    }

    // Otherwise use the date object directly
    return format(date, formatStr)
  } catch (error) {
    console.error("Error formatting date:", error, dateString)
    return "N/A"
  }
}

// Function to ensure we have a valid date for created_at and updated_at
function ensureValidDates(booking: any) {
  // If created_at is missing or invalid, use the current date
  if (!booking.created_at || new Date(booking.created_at).toString() === "Invalid Date") {
    booking.created_at = new Date().toISOString()
  }

  // If updated_at is missing or invalid, use created_at
  if (!booking.updated_at || new Date(booking.updated_at).toString() === "Invalid Date") {
    booking.updated_at = booking.created_at
  }

  return booking
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch booking details with proper ship information
  let booking = await fetchBookingById(params.id)
  if (!booking) {
    redirect("/dashboard/bookings")
  }

  // If ship_name is not available from the main booking, fetch it from booking_tours
  if (!booking.ship_name && booking.tours && booking.tours.length > 0) {
    // Use the ship name from the first tour if available
    booking.ship_name = booking.tours[0].ship_name
  }

  // If still no ship name, try to fetch from the tour's ship_id
  if (!booking.ship_name && booking.tour_id) {
    try {
      const shipResult = await executeQuery(
        `SELECT s.name as ship_name 
       FROM tours t 
       JOIN ships s ON t.ship_id = s.id 
       WHERE t.id = $1`,
        [booking.tour_id],
      )
      if (shipResult.length > 0) {
        booking.ship_name = shipResult[0].ship_name
      }
    } catch (error) {
      console.error("Error fetching ship name:", error)
    }
  }

  // Ensure we have valid dates
  booking = ensureValidDates(booking)

  // Format created_at date safely
  const createdAtFormatted = safeFormatDate(booking.created_at)

  // Format tour_date safely
  const tourDateFormatted = safeFormatDate(booking.tour_date)

  // Format updated_at date safely
  const updatedAtFormatted = safeFormatDate(booking.updated_at)

  // Check if booking has multiple tours
  const hasMultipleTours = booking.tours && booking.tours.length > 1

  return (
    <div className="p-6">
      <main>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
              <p className="text-muted-foreground">
                Reference: {booking.booking_reference} | Created: {createdAtFormatted}
              </p>
            </div>
            <div className="flex gap-2">
              <DownloadReceiptButton bookingId={booking.id} />
              <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                <Button className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteBookingButton bookingId={booking.id} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-[#6b0f1a]" />
                  Tour Details
                </CardTitle>
                <CardDescription>Information about the booked tour</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tour</h3>
                    <p className="text-lg font-medium">{booking.tour_name || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Ship</h3>
                    <p className="text-lg font-medium">{booking.ship_name || "Unknown Ship"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p className="text-lg font-medium">{booking.location || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                    <p className="flex items-center gap-2 text-lg font-medium">
                      <CalendarIcon className="h-4 w-4 text-[#6b0f1a]" />
                      {tourDateFormatted}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Adults</h3>
                    <p className="text-lg font-medium">{booking.adults}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Children</h3>
                    <p className="text-lg font-medium">{booking.children}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Passengers</h3>
                    <p className="text-lg font-medium">{booking.total_pax}</p>
                  </div>
                </div>

                {booking.agent_name && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tour Guide</h3>
                    <p className="text-lg font-medium">{booking.agent_name}</p>
                  </div>
                )}

                {booking.marketing_source && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Marketing Source</h3>
                    <p className="text-lg font-medium">{booking.marketing_source}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#6b0f1a]" />
                  Customer Information
                </CardTitle>
                <CardDescription>Details about the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg font-medium">{booking.customer_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg font-medium">{booking.email}</p>
                </div>
                {booking.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="text-lg font-medium">{booking.phone}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Agent</h3>
                  <p className="text-lg font-medium">{booking.agent_name || "Direct Booking"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#6b0f1a]" />
                  Payment Information
                </CardTitle>
                <CardDescription>Details about the payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Deposit</h3>
                    <p className="text-lg font-medium">€{Number(booking.deposit).toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
                    <p className="text-lg font-medium">€{Number(booking.remaining_balance).toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                    <p className="text-lg font-medium">€{Number(booking.total_payment).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="text-lg font-medium capitalize">{booking.status}</p>
                  </div>
                  {booking.agent_name && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Commission</h3>
                      <p className="text-lg font-medium">€{Number(booking.commission).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {booking.payment_location && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Location</h3>
                    <p className="text-lg font-medium">{booking.payment_location}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#6b0f1a]" />
                  Additional Information
                </CardTitle>
                <CardDescription>Notes and other details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="whitespace-pre-wrap text-lg font-medium">{booking.notes || "No notes provided"}</p>
                </div>

                {booking.other && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Other Information</h3>
                    <p className="whitespace-pre-wrap text-lg font-medium">{booking.other}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Booking ID: {booking.id} | Last Updated: {updatedAtFormatted}
                </p>
              </CardFooter>
            </Card>
          </div>

          {booking.tours && booking.tours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-[#6b0f1a]" />
                  {hasMultipleTours ? "Multiple Tours" : "Tours"}
                </CardTitle>
                <CardDescription>
                  {hasMultipleTours ? "This booking includes multiple tours" : "Tour details for this booking"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left w-10">#</th>
                        <th className="px-4 py-2 text-left">Tour</th>
                        <th className="px-4 py-2 text-left">Ship</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Passengers</th>
                        <th className="px-4 py-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.tours.map((tour: any, index: number) => {
                        // Format date with error handling
                        const tourDate = safeFormatDate(tour.tour_date)

                        return (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{tour.tour_name}</td>
                            <td className="px-4 py-2">{tour.ship_name}</td>
                            <td className="px-4 py-2">{tourDate}</td>
                            <td className="px-4 py-2">{tour.total_pax}</td>
                            <td className="px-4 py-2 text-right">€{Number(tour.price).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

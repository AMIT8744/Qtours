import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewBookingNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          <Link href="/dashboard/bookings">
            <Button variant="default" className="bg-[#6b0f1a] hover:bg-[#8a1325]">
              Return to Bookings
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

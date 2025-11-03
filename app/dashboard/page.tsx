import { Skeleton } from "@/components/ui/skeleton"
import { fetchBookings } from "@/app/actions/dashboard-actions"
import { LayoutDashboard } from "lucide-react"
import { getSession } from "@/app/actions/auth-actions"
import { DashboardPageClient } from "./dashboard-page-client"

// Disable static generation for this page
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Fetch recent bookings data server-side
  const recentBookings = await fetchBookings()

  // Get user session to check role
  const session = await getSession()
  const userRole = session?.user?.role

  // Determine if stats should be hidden (hide for agents)
  const hideStats = userRole === "agent"

  return <DashboardPageClient recentBookings={recentBookings} hideStats={hideStats} />
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-[#6b0f1a]" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome to Viaggi Del Qatar Tours Booking System</p>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" />

      <div className="space-y-6 mt-4">
        {/* Note: We can't easily check role in skeleton, so we show it by default */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[450px] w-full" />
        <Skeleton className="h-[450px] w-full" />
      </div>
    </div>
  )
}

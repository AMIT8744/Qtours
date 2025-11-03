"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function DashboardTabs() {
  const pathname = usePathname()

  const isOverviewActive = pathname === "/dashboard"
  const isBookingsActive = pathname.startsWith("/dashboard/bookings")

  return (
    <div className="flex w-full overflow-hidden rounded-lg border">
      <Link
        href="/dashboard"
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-center font-medium transition-colors ${
          isOverviewActive
            ? "bg-[#6b0f1a] text-white hover:bg-[#6b0f1a]/90"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        }`}
      >
        <span>Overview</span>
      </Link>
      <Link
        href="/dashboard/bookings"
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-center font-medium transition-colors ${
          isBookingsActive
            ? "bg-[#6b0f1a] text-white hover:bg-[#6b0f1a]/90"
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        }`}
      >
        <span>Bookings</span>
      </Link>
    </div>
  )
}

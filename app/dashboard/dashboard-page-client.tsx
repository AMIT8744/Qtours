"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingStats } from "@/components/booking-stats"
import { RecentBookingsTable } from "@/components/recent-bookings-table"
import { UpcomingToursSection } from "@/components/upcoming-tours-section"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { DashboardTabs } from "./dashboard-tabs"
import { useTranslation } from "@/contexts/translation-context"

interface DashboardPageClientProps {
  recentBookings: any[]
  hideStats: boolean
}

export function DashboardPageClient({ recentBookings, hideStats }: DashboardPageClientProps) {
  const { t } = useTranslation()

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-[#6b0f1a]" />
              {t("dashboard.title", "Dashboard")}
            </h1>
            <p className="text-muted-foreground">
              {t("dashboard.welcome", "Welcome to Viaggi Del Qatar Tours Booking System")}
            </p>
          </div>
          <div>
            <Button asChild className="bg-[#6b0f1a] hover:bg-[#6b0f1a]/90 text-white">
              <Link href="/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("navigation.addNewBooking", "Add New Booking")}
              </Link>
            </Button>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <DashboardTabs />
        </Suspense>

        <div className="space-y-6 mt-4">
          {/* Conditionally render BookingStats - hide for agents */}
          <div className={hideStats ? "hidden" : ""}>
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              }
            >
              <BookingStats />
            </Suspense>
          </div>

          {/* Recent Bookings - Full Width */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard.recentBookings", "Recent Bookings")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.recentBookingsDescription", "Recent booking activity across your account")}
                  </p>
                </div>
                <a href="/dashboard/bookings" className="text-sm text-blue-600 hover:text-blue-800">
                  {t("dashboard.viewAllBookings", "View All Bookings →")}
                </a>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
                <RecentBookingsTable bookings={recentBookings} />
              </Suspense>
            </div>
          </div>

          {/* Upcoming Tours - Full Width */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard.upcomingTours", "Upcoming Tours")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.upcomingToursDescription", "Tours scheduled in the next 30 days")}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
                <UpcomingToursSection />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

function DashboardSkeleton() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-[#6b0f1a]" />
            {t("dashboard.title", "Dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcome", "Welcome to Viaggi Del Qatar Tours Booking System")}
          </p>
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

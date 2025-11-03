"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { RecentBookingsTable } from "@/components/recent-bookings-table"

interface Booking {
  id: string
  booking_reference: string
  created_at: string
  tour_date?: string
  customer_name: string
  email: string
  phone: string
  agent_name?: string
  commission?: number
  status: string
  deposit: number
  remaining_balance: number
  total_payment: number
  total_pax: number
  tour_count: number
}

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="border rounded-lg bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <p className="text-sm text-muted-foreground">Recent booking activity across your account</p>
        </div>
        <Link
          href="/dashboard/bookings"
          className="text-[#6b0f1a] hover:text-[#6b0f1a]/80 hover:underline flex items-center group transition-all duration-200"
        >
          View All Bookings{" "}
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
      <RecentBookingsTable bookings={bookings} />
    </div>
  )
}

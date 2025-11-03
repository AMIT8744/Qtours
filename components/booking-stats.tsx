"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CreditCard, Ship, Users, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface BookingStats {
  totalBookings: number
  totalPassengers: number
  totalRevenue: number
  totalNet: number
  confirmedBookings: number
  pendingBookings: number
  paidBookings: number
}

export function BookingStats() {
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    totalPassengers: 0,
    totalRevenue: 0,
    totalNet: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    paidBookings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const fetchStats = async () => {
    try {
      console.log("📊 Fetching booking stats for period:", activeTab)
      setLoading(true)
      setError(null)

      // Add a cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime()
      const url = `/api/bookings/stats?period=${activeTab}&_=${timestamp}`
      console.log("🔗 Fetching from URL:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 Received stats data:", data)

      if (data.stats) {
        setStats(data.stats)
      } else {
        console.warn("⚠️ No stats in response, using defaults")
        setStats({
          totalBookings: 0,
          totalPassengers: 0,
          totalRevenue: 0,
          totalNet: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          paidBookings: 0,
        })
      }

      if (data.error) {
        console.warn("⚠️ API returned error:", data.error)
      }
    } catch (err) {
      console.error("❌ Error fetching booking stats:", err)
      setError(err instanceof Error ? err.message : "Failed to load booking statistics")

      // Set default stats on error
      setStats({
        totalBookings: 0,
        totalPassengers: 0,
        totalRevenue: 0,
        totalNet: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        paidBookings: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [activeTab])

  const handleRefresh = () => {
    fetchStats()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-[#6b0f1a]" />
            <CardTitle>Booking Statistics</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>View booking statistics for different time periods</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
              All Time
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
              This Month
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
              This Week
            </TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-[#7f1d1d] data-[state=active]:text-white">
              Today
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b0f1a]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Ship className="h-4 w-4 text-[#6b0f1a]" />
                    <span className="text-sm text-muted-foreground">Total Bookings</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#6b0f1a]" />
                    <span className="text-sm text-muted-foreground">Total Passengers</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalPassengers}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-[#6b0f1a]" />
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-[#6b0f1a]" />
                    <span className="text-sm text-muted-foreground">Total NET</span>
                  </div>
                  <div className="text-2xl font-bold">€{stats.totalNet.toFixed(2)}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Confirmed Bookings</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-muted-foreground">Pending Bookings</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Paid Bookings</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.paidBookings}</div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

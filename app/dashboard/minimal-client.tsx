"use client"

import { useState, useEffect } from "react"

export default function MinimalDashboardClient() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTours: 0,
    totalPassengers: 0,
    totalRevenue: 0,
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // This is a placeholder for future data fetching
    // We're not actually fetching data to avoid any potential issues

    // Simulate loading
    const timer = setTimeout(() => {
      setStats({
        totalBookings: 42,
        activeTours: 12,
        totalPassengers: 156,
        totalRevenue: 24680,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
        <p className="text-2xl font-bold">{stats.totalBookings}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Active Tours</h3>
        <p className="text-2xl font-bold">{stats.activeTours}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Total Passengers</h3>
        <p className="text-2xl font-bold">{stats.totalPassengers}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
        <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  )
}

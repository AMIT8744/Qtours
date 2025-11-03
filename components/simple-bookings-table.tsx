"use client"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function SimpleBookingsTable() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/bookings/all")
        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }
        const data = await response.json()
        setBookings(data || [])
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError(err.message || "Failed to load bookings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium">Error Loading Bookings</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return "No date"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  // Format currency for display
  function formatCurrency(value) {
    const num = Number(value)
    return isNaN(num) ? "€0.00" : `€${num.toFixed(2)}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3">Reference</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Customer</th>
            <th className="px-6 py-3">Tour</th>
            <th className="px-6 py-3">Total</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No bookings found. Create your first booking to see it here.
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_reference || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(booking.tour_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.customer_name || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.tour_name || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(booking.total_payment)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      booking.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status || "pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/dashboard/bookings/${booking.id}`}>
                    <span className="text-[#7f1d1d] hover:underline">View</span>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

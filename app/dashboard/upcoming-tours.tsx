"use client"

import { useState, useEffect } from "react"

export default function UpcomingTours() {
  const [tours, setTours] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcomingTours() {
      try {
        const response = await fetch("/api/bookings/upcoming")
        if (response.ok) {
          const data = await response.json()
          setTours(data.tours || [])
        } else {
          // Fallback to mock data with proper ship names
          setTours([
            {
              id: 1,
              name: "Desert Safari Adventure",
              start_date: "2024-06-15",
              end_date: "2024-06-17",
              total_pax: 12,
              ship_name: "MSC",
              location: "doha",
              image_url: "/vast-desert-landscape.png",
            },
            {
              id: 2,
              name: "Doha City Tour",
              start_date: "2024-06-20",
              end_date: "2024-06-20",
              total_pax: 8,
              ship_name: "MSC",
              location: "doha",
              image_url: "/vibrant-cityscape.png",
            },
            {
              id: 3,
              name: "Cultural Museum Visit",
              start_date: "2024-06-25",
              end_date: "2024-06-25",
              total_pax: 15,
              ship_name: "MSC",
              location: "doha",
              image_url: "/museum-interior.png",
            },
          ])
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching upcoming tours:", error)
        // Fallback to mock data with proper ship names
        setTours([
          {
            id: 1,
            name: "DUBAI XL",
            start_date: new Date().toISOString().split("T")[0],
            total_pax: 3,
            adults: 2,
            children: 1,
            ship_name: "MSC",
            location: "doha",
            image_url: "/placeholder.svg?height=128&width=256&query=dubai+tour",
          },
        ])
        setIsLoading(false)
      }
    }

    fetchUpcomingTours()
  }, [])

  // Format date to display in a readable format
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm mb-8">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Upcoming Tours</h2>
        <p className="text-sm text-gray-500">Tours scheduled in the near future</p>
      </div>
      <div className="p-4">
        {isLoading ? (
          <p className="text-center py-4 text-gray-500">Loading upcoming tours...</p>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.map((tour) => (
              <div key={tour.id} className="border rounded-lg overflow-hidden">
                <img
                  src={tour.image_url || "/placeholder.svg"}
                  alt={tour.name || tour.tour_name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium">{tour.name || tour.tour_name}</h3>
                  <p className="text-sm text-gray-500">
                    {tour.ship_name || "MSC"} - {tour.location || "doha"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(tour.start_date || tour.tour_date)}
                    {tour.start_date !== tour.end_date && tour.end_date && ` - ${formatDate(tour.end_date)}`}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">{tour.total_pax}</span> passengers
                    {tour.adults && tour.children && (
                      <span className="text-gray-500">
                        {" "}
                        ({tour.adults} adults, {tour.children} children)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No upcoming tours to display</p>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { getTours, getLocations, getAgents, getBookingAgents } from "@/lib/data"
import type { Tour, Location, Agent, BookingAgent, Ship } from "@/lib/models"
import AddBookingForm from "./AddBookingForm"
import { getShips } from "@/lib/data" // Assuming getShips is in lib/data

const AddBookingPageClient = () => {
  const [tours, setTours] = useState<Tour[]>([])
  const [ships, setShips] = useState<Ship[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [bookingAgents, setBookingAgents] = useState<BookingAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [toursData, shipsData, locationsData, agentsData, bookingAgentsData] = await Promise.all([
          getTours(),
          getShips(), // This should fetch from the ships management system
          getLocations(),
          getAgents(),
          getBookingAgents(),
        ])

        console.log("Fetched ships data:", shipsData)
        setTours(toursData)
        setShips(shipsData)
        setLocations(locationsData)
        setAgents(agentsData)
        setBookingAgents(bookingAgentsData)
      } catch (error) {
        console.error("Error fetching form data:", error)
        setError("Failed to load form data. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <AddBookingForm tours={tours} ships={ships} locations={locations} agents={agents} bookingAgents={bookingAgents} />
    </div>
  )
}

export default AddBookingPageClient

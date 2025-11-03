"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getTours, getLocations, getAgents } from "@/app/actions/tour-actions"
import { getShips } from "@/app/actions/ship-actions"
import { getBookingAgents } from "@/app/actions/booking-agent-actions"
import AddBookingForm from "@/components/add-booking-form"

export default function NewBookingPageClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold">New Booking</h1>
        <p className="text-gray-600 mt-2">Create a new booking for a customer</p>
      </div>

      <Suspense fallback={<BookingFormSkeleton />}>
        <BookingFormWithData />
      </Suspense>
    </div>
  )
}

async function BookingFormWithData() {
  try {
    console.log("BOOKING FORM: Starting to fetch data")

    // Fetch booking agents first to ensure it's executed
    const bookingAgents = await getBookingAgents()
    console.log("BOOKING FORM: Booking agents fetched:", bookingAgents)

    // Fetch ships separately to ensure it's executed
    const ships = await getShips()
    console.log("BOOKING FORM: Ships fetched:", ships)

    // Then fetch the rest of the data
    const [tours, locations, agents] = await Promise.all([getTours(), getLocations(), getAgents()])

    console.log("BOOKING FORM: All data fetched")
    console.log("BOOKING FORM: Tours count:", tours?.length || 0)
    console.log("BOOKING FORM: Ships count:", ships?.length || 0)
    console.log("BOOKING FORM: Booking agents count:", bookingAgents?.length || 0)

    // Create a hardcoded list of booking agents as a fallback
    const fallbackAgents = [
      { id: "1", name: "Lusi" },
      { id: "2", name: "Jamila" },
      { id: "3", name: "Simona" },
      { id: "4", name: "Romina" },
      { id: "5", name: "Martina" },
      { id: "6", name: "Palma" },
      { id: "7", name: "guest" },
    ]

    // Create a hardcoded list of ships as a fallback
    const fallbackShips = [
      { id: "1", name: "AIDA" },
      { id: "2", name: "Al Shamal" },
      { id: "3", name: "Costa" },
      { id: "4", name: "Desert Cruiser" },
      { id: "5", name: "Desert Voyager" },
      { id: "6", name: "Heritage Vessel" },
      { id: "7", name: "MSC" },
      { id: "8", name: "Pearl Explorer" },
      { id: "9", name: "Qatar Explorer" },
    ]

    // Use the fetched booking agents if available, otherwise use the fallback
    const finalBookingAgents = bookingAgents && bookingAgents.length > 0 ? bookingAgents : fallbackAgents

    // Use the fetched ships if available, otherwise use the fallback
    const finalShips = ships && ships.length > 0 ? ships : fallbackShips

    console.log("BOOKING FORM: Final booking agents:", finalBookingAgents)

    if (!tours || tours.length === 0) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No tours available. Please{" "}
                <Link href="/dashboard/tours/add" className="font-medium underline">
                  add a tour
                </Link>{" "}
                first.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Pass all required data properly to the form component
    return (
      <AddBookingForm
        tours={tours || []}
        ships={finalShips}
        locations={locations || []}
        agents={agents || []}
        bookingAgents={finalBookingAgents}
      />
    )
  } catch (error) {
    console.error("Error loading booking form data:", error)
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load booking form data. Please try{" "}
              <button onClick={() => window.location.reload()} className="font-medium underline">
                refreshing the page
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }
}

function BookingFormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 mt-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mt-8"></div>
      </div>
    </div>
  )
}

import { unstable_noStore as noStore } from "next/cache"
import { db } from "@/db"
import type { Tour } from "@/types"
import { safeExecuteQuery } from "@/lib/utils"

const ITEMS_PER_PAGE = 6

export async function getBookingTours(bookingId: string) {
  try {
    if (!bookingId) {
      console.log("BOOKING TOURS: No booking ID provided")
      return []
    }

    console.log(`BOOKING TOURS: Fetching tours for booking ID: ${bookingId}`)

    const tours = await safeExecuteQuery(
      `
      SELECT 
        bt.id,
        bt.booking_id,
        bt.tour_id,
        bt.tour_date,
        bt.adults,
        bt.children,
        bt.total_pax,
        bt.price,
        COALESCE(bt.tour_guide, ba.name, '') as tour_guide,
        bt.notes,
        bt.created_at,
        bt.updated_at,
        t.name as tour_name,
        s.name as ship_name,
        bt.booking_agent_id
      FROM booking_tours bt
      LEFT JOIN tours t ON bt.tour_id = t.id
      LEFT JOIN ships s ON t.ship_id = s.id
      LEFT JOIN booking_agents ba ON bt.booking_agent_id = ba.id
      WHERE bt.booking_id = $1
      ORDER BY bt.created_at ASC
      `,
      [bookingId],
      {
        useCache: false,
        timeout: 8000, // Shorter timeout
        retries: 1, // Fewer retries
        useMockOnFailure: true,
      },
    )

    console.log(`BOOKING TOURS: Query completed, found ${tours?.length || 0} tours`)

    if (tours && Array.isArray(tours) && tours.length > 0) {
      console.log("BOOKING TOURS: Sample tour data:", tours[0])
      return tours.map((tour) => ({
        ...tour,
        // Ensure required fields are properly set
        tour_guide: tour.tour_guide || "",
        deposit: tour.deposit || 0,
        tour_name: tour.tour_name || "Unknown Tour",
        ship_name: tour.ship_name || "Unknown Ship",
      }))
    }

    // If no tours found, return empty array (don't create mock data here)
    console.log("BOOKING TOURS: No tours found in database")
    return []
  } catch (error) {
    console.error("BOOKING TOURS: Error in getBookingTours:", error)

    // Return empty array instead of mock data to let the form handle fallback
    return []
  }
}

export async function fetchFilteredToursCount(query: string) {
  noStore()
  try {
    const count = await db.query(
      `SELECT COUNT(*) FROM tours WHERE tour_name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR category ILIKE $1`,
      [`%${query}%`],
    )
    return Number(count.rows[0].count)
  } catch (error) {
    console.error("Failed to fetch total tours count:", error)
    throw new Error("Failed to fetch total tours count.")
  }
}

const tourCategories = ["Adventure", "Cultural", "Relaxation", "Hiking", "City Tours"]

export async function fetchTourCategories() {
  noStore()
  return tourCategories
}

// Mock data for testing purposes
export const toursMock: Tour[] = [
  {
    id: "1",
    tour_name: "Grand Canyon Adventure",
    description: "Explore the majestic Grand Canyon with our guided tour.",
    price: 499.99,
    duration: "3 days",
    location: "Arizona, USA",
    image_url: "/images/grand_canyon.jpg",
    category: "Adventure",
  },
  {
    id: "2",
    tour_name: "Kyoto Cultural Immersion",
    description: "Immerse yourself in the rich culture of Kyoto, Japan.",
    price: 799.99,
    duration: "5 days",
    location: "Kyoto, Japan",
    image_url: "/images/kyoto.jpg",
    category: "Cultural",
  },
  {
    id: "3",
    tour_name: "Bali Relaxation Retreat",
    description: "Unwind and rejuvenate in the serene landscapes of Bali.",
    price: 699.99,
    duration: "7 days",
    location: "Bali, Indonesia",
    image_url: "/images/bali.jpg",
    category: "Relaxation",
  },
  {
    id: "4",
    tour_name: "Swiss Alps Hiking Expedition",
    description: "Embark on an unforgettable hiking adventure in the Swiss Alps.",
    price: 899.99,
    duration: "4 days",
    location: "Swiss Alps, Switzerland",
    image_url: "/images/swiss_alps.jpg",
    category: "Hiking",
  },
  {
    id: "5",
    tour_name: "Paris City of Lights Tour",
    description: "Discover the iconic landmarks and vibrant culture of Paris.",
    price: 599.99,
    duration: "3 days",
    location: "Paris, France",
    image_url: "/images/paris.jpg",
    category: "City Tours",
  },
  {
    id: "6",
    tour_name: "Safari Adventure",
    description: "Experience the thrill of a lifetime on an African safari.",
    price: 999.99,
    duration: "6 days",
    location: "Serengeti, Tanzania",
    image_url: "/images/serengeti.jpg",
    category: "Adventure",
  },
]

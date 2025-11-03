"use server"

import { executeQuery, safeExecuteQuery, invalidateCache } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTour(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const location_name = formData.get("location_name") as string
    const duration = formData.get("duration") as string
    const price = Number.parseFloat(formData.get("price") as string) || 0
    const children_price = Number.parseFloat(formData.get("children_price") as string) || 0
    const capacity = Number.parseInt(formData.get("capacity") as string) || 0
    const status = (formData.get("status") as string) || "active"
    const description = formData.get("description") as string
    const description_it = formData.get("description_it") as string
    const ship = formData.get("ship") as string

    // Handle images
    const images: string[] = []
    const imageEntries = formData.getAll("images")
    imageEntries.forEach((entry) => {
      if (typeof entry === "string") {
        images.push(entry)
      }
    })

    // Handle available dates
    const availableDatesJson = formData.get("available_dates") as string
    let availableDates: string[] = []
    if (availableDatesJson) {
      try {
        availableDates = JSON.parse(availableDatesJson)
      } catch (e) {
        console.error("Error parsing available dates:", e)
      }
    }

    // Find or create location
    let locationId = null
    if (location_name) {
      const existingLocations = await executeQuery("SELECT id FROM locations WHERE name = $1 LIMIT 1", [location_name])

      if (existingLocations.length > 0) {
        locationId = existingLocations[0].id
      } else {
        const newLocation = await executeQuery("INSERT INTO locations (name) VALUES ($1) RETURNING id", [location_name])
        locationId = newLocation[0].id
      }
    }

    // Check if location_name column exists in tours table
    const columnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND column_name = 'location_name'
    `)

    const hasLocationNameColumn = columnCheck.length > 0

    let result
    if (hasLocationNameColumn) {
      // Use the new schema with location_name column
      result = await executeQuery(
        `
        INSERT INTO tours (
          name, location_id, location_name, duration, price, children_price, capacity, 
          status, description, description_it, images, available_dates, ship
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
        `,
        [
          name,
          locationId,
          location_name,
          duration,
          price,
          children_price,
          capacity,
          status,
          description,
          description_it,
          images,
          availableDates,
          ship,
        ],
      )
    } else {
      // Use the old schema with only location_id
      result = await executeQuery(
        `
        INSERT INTO tours (
          name, location_id, duration, price, children_price, capacity, 
          status, description, description_it, images, available_dates, ship
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
        `,
        [
          name,
          locationId,
          duration,
          price,
          children_price,
          capacity,
          status,
          description,
          description_it,
          images,
          availableDates,
          ship,
        ],
      )
    }

    const tourId = result[0].id

    // Fetch the complete tour data
    const newTour = await getTourById(tourId)

    // Invalidate cache for tours
    invalidateCache("tours")

    // Revalidate paths
    revalidatePath("/dashboard/tours")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/bookings/add")
    revalidatePath("/dashboard/bookings/new")

    return {
      success: true,
      tourId: tourId,
      tour: newTour,
      message: `Tour "${name}" created successfully!`,
    }
  } catch (error) {
    console.error("Error creating tour:", error)
    return {
      success: false,
      message: "Failed to create tour. Please try again.",
    }
  }
}

export async function updateTour(tourId: string, data: FormData | any) {
  try {
    let name: string
    let price: number
    let children_price: number
    let location_name: string
    let duration: string
    let capacity: number
    let status: string
    let description: string
    let description_it: string
    let images: string[]
    let available_dates: string[]
    let ship: string

    // Handle both FormData and regular object
    if (data instanceof FormData) {
      name = data.get("name") as string
      price = Number.parseFloat(data.get("price") as string)
      children_price = Number.parseFloat(data.get("children_price") as string) || 0
      location_name = data.get("location_name") as string
      duration = data.get("duration") as string
      capacity = Number.parseInt(data.get("capacity") as string) || 0
      status = (data.get("status") as string) || "active"
      description = data.get("description") as string
      description_it = data.get("description_it") as string
      images = JSON.parse((data.get("images") as string) || "[]")
      available_dates = JSON.parse((data.get("available_dates") as string) || "[]")
      ship = data.get("ship") as string
    } else {
      // Handle regular object
      name = data.name
      price = data.price ? Number.parseFloat(data.price.toString()) : 0
      children_price = data.children_price ? Number.parseFloat(data.children_price.toString()) : 0
      location_name = data.location_name || ""
      duration = data.duration || ""
      capacity = data.capacity ? Number.parseInt(data.capacity.toString()) : 0
      status = data.status || "active"
      description = data.description || ""
      description_it = data.description_it || ""
      images = data.images || []
      available_dates = data.available_dates || []
      ship = data.ship || ""
    }

    if (!name) {
      return { success: false, message: "Tour name is required" }
    }

    // Find or create location
    let locationId = null
    if (location_name) {
      const existingLocations = await executeQuery("SELECT id FROM locations WHERE name = $1 LIMIT 1", [location_name])

      if (existingLocations.length > 0) {
        locationId = existingLocations[0].id
      } else {
        const newLocation = await executeQuery("INSERT INTO locations (name) VALUES ($1) RETURNING id", [location_name])
        locationId = newLocation[0].id
      }
    }

    // Check if location_name column exists in tours table
    const columnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tours' 
      AND column_name = 'location_name'
    `)

    const hasLocationNameColumn = columnCheck.length > 0

    if (hasLocationNameColumn) {
      // Use the new schema with location_name column
      await executeQuery(
        `
        UPDATE tours 
        SET 
          name = $1,
          location_id = $2,
          location_name = $3,
          duration = $4,
          price = $5,
          children_price = $6,
          capacity = $7,
          status = $8,
          description = $9,
          description_it = $10,
          images = $11,
          available_dates = $12,
          updated_at = CURRENT_TIMESTAMP,
          ship = $13
        WHERE id = $14
        `,
        [
          name,
          locationId,
          location_name,
          duration,
          price,
          children_price,
          capacity,
          status,
          description,
          description_it,
          images,
          available_dates,
          ship,
          tourId,
        ],
      )
    } else {
      // Use the old schema with only location_id
      await executeQuery(
        `
        UPDATE tours 
        SET 
          name = $1,
          location_id = $2,
          duration = $3,
          price = $4,
          children_price = $5,
          capacity = $6,
          status = $7,
          description = $8,
          description_it = $9,
          images = $10,
          available_dates = $11,
          updated_at = CURRENT_TIMESTAMP,
          ship = $12
        WHERE id = $13
        `,
        [
          name,
          locationId,
          duration,
          price,
          children_price,
          capacity,
          status,
          description,
          description_it,
          images,
          available_dates,
          ship,
          tourId,
        ],
      )
    }

    // Invalidate cache for tours
    invalidateCache("tours")

    revalidatePath("/dashboard/tours")
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/tours/${tourId}`)
    revalidatePath("/dashboard/bookings/add")
    revalidatePath("/dashboard/bookings/new")

    return {
      success: true,
      message: `Tour "${name}" updated successfully!`,
    }
  } catch (error) {
    console.error(`Error updating tour with ID ${tourId}:`, error)
    return {
      success: false,
      message: "Failed to update tour. Please try again.",
    }
  }
}

export async function getTours() {
  try {
    console.log("Fetching all tours...")

    const tours = await safeExecuteQuery(
      `
      SELECT 
        t.id, 
        t.name, 
        t.price,
        t.children_price,
        t.status,
        t.location_id,
        t.capacity,
        t.duration,
        t.description,
        t.description_it,
        t.available_dates,
        t.ship,
        t.created_at,
        t.updated_at,
        COALESCE(t.location_name, l.name) as location_name,
        l.name as location,
        COALESCE(ships.name, 'MSC') as ship_name,
        COALESCE(
          (SELECT COUNT(*) FROM booking_tours bt WHERE bt.tour_id = t.id), 
          0
        ) as booking_count,
        t.images
      FROM 
        tours t
      LEFT JOIN 
        locations l ON t.location_id = l.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      ORDER BY 
        t.created_at DESC
      `,
      [],
      { useCache: false }, // Disable cache to always get fresh data
    )

    console.log(`Found ${tours.length} tours`)
    return tours
  } catch (error) {
    console.error("Error fetching tours:", error)
    return []
  }
}

export async function getTourById(id: string) {
  try {
    if (!id) {
      return null
    }

    const tours = await executeQuery(
      `
      SELECT 
        t.id, 
        t.name, 
        t.price,
        t.children_price,
        t.status,
        t.location_id,
        t.capacity,
        t.duration,
        t.description,
        t.description_it,
        t.available_dates,
        t.images,
        t.ship,
        t.created_at,
        t.updated_at,
        COALESCE(t.location_name, l.name) as location_name,
        l.name as location,
        COALESCE(ships.name, 'MSC') as ship_name
      FROM 
        tours t
      LEFT JOIN 
        locations l ON t.location_id = l.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      WHERE
        t.id = $1
      `,
      [id],
    )

    if (tours.length === 0) {
      return null
    }

    return tours[0]
  } catch (error) {
    console.error(`Error fetching tour with ID ${id}:`, error)
    return null
  }
}

export async function deleteTour(id: string) {
  try {
    // Check if tour is used in any bookings
    const bookings = await executeQuery(
      `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE tour_id = $1
      `,
      [id],
    )

    if (bookings[0].count > 0) {
      return {
        success: false,
        message: "Cannot delete tour as it is used in existing bookings.",
      }
    }

    // Also check booking_tours table
    const bookingTours = await executeQuery(
      `
      SELECT COUNT(*) as count
      FROM booking_tours
      WHERE tour_id = $1
      `,
      [id],
    )

    if (bookingTours[0].count > 0) {
      return {
        success: false,
        message: "Cannot delete tour as it is used in existing bookings.",
      }
    }

    // If not used, delete the tour
    await executeQuery(`DELETE FROM tours WHERE id = $1`, [id])

    // Invalidate cache for tours
    invalidateCache("tours")

    revalidatePath("/dashboard/tours")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/bookings/add")
    revalidatePath("/dashboard/bookings/new")

    return {
      success: true,
      message: "Tour deleted successfully!",
    }
  } catch (error) {
    console.error(`Error deleting tour with ID ${id}:`, error)
    return {
      success: false,
      message: "Failed to delete tour. Please try again.",
    }
  }
}

export async function searchTours(query: string) {
  try {
    const result = await executeQuery(
      `
      SELECT 
        t.id, 
        t.name, 
        t.price,
        t.children_price,
        t.status,
        t.location_id,
        t.capacity,
        t.duration,
        t.description,
        t.description_it,
        t.available_dates,
        t.ship,
        t.created_at,
        t.updated_at,
        COALESCE(t.location_name, l.name) as location_name,
        l.name as location,
        COALESCE(ships.name, 'MSC') as ship_name,
        COALESCE(
          (SELECT COUNT(*) FROM booking_tours bt WHERE bt.tour_id = t.id), 
          0
        ) as booking_count,
        t.images
      FROM 
        tours t
      LEFT JOIN 
        locations l ON t.location_id = l.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      WHERE 
        t.name ILIKE $1 OR 
        COALESCE(t.location_name, l.name) ILIKE $1 OR
        t.description ILIKE $1
      ORDER BY 
        t.name
      `,
      [`%${query}%`],
    )
    return result
  } catch (error) {
    console.error("Error searching tours:", error)
    throw new Error("Failed to search tours")
  }
}

export async function getLocations() {
  try {
    const locations = await executeQuery(
      `
      SELECT id, name
      FROM locations
      ORDER BY name ASC
      `,
      [],
    )

    return locations
  } catch (error) {
    console.error("Error fetching locations:", error)
    return []
  }
}

export async function getShips() {
  try {
    const ships = await executeQuery(
      `
      SELECT id, name, capacity, created_at, updated_at
      FROM ships
      ORDER BY name ASC
      `,
      [],
      { useCache: false }, // Disable cache to ensure fresh data
    )

    console.log(`Fetched ${ships.length} ships from ships management`)
    return ships
  } catch (error) {
    console.error("Error fetching ships from ships management:", error)
    // Return empty array as fallback
    return []
  }
}

export async function getAgents() {
  try {
    const agents = await executeQuery(
      `
      SELECT id, name, commission_rate
      FROM agents
      ORDER BY name ASC
      `,
      [],
      { useCache: true, cacheTTL: 10 * 60 * 1000 }, // 10 minute cache
    )

    return agents
  } catch (error) {
    console.error("Error fetching agents:", error)
    // Return empty array as fallback
    return []
  }
}

export async function getAllTours() {
  try {
    const tours = await safeExecuteQuery(
      `
      SELECT 
        t.id, 
        t.name, 
        t.price,
        t.children_price,
        t.status,
        t.location_id,
        t.capacity,
        t.duration,
        t.description,
        t.description_it,
        t.available_dates,
        t.ship,
        t.created_at,
        t.updated_at,
        COALESCE(t.location_name, l.name) as location_name,
        l.name as location,
        COALESCE(ships.name, 'MSC') as ship_name,
        COALESCE(
          (SELECT COUNT(*) FROM booking_tours bt WHERE bt.tour_id = t.id), 
          0
        ) as booking_count
      FROM 
        tours t
      LEFT JOIN 
        locations l ON t.location_id = l.id
      LEFT JOIN 
        ships ON ships.id = t.ship_id
      ORDER BY 
        t.name ASC
      `,
      [],
      { useCache: false }, // Disable cache to always get fresh data
    )

    return tours
  } catch (error) {
    console.error("Error fetching all tours:", error)
    return []
  }
}

"use server"

import { executeQuery } from "@/lib/db"

export async function getAllLocations() {
  try {
    const query = `
      SELECT 
        id, 
        name,
        created_at,
        updated_at
      FROM 
        locations
      ORDER BY 
        name ASC
    `

    const result = await executeQuery(query, [])
    return result
  } catch (error) {
    console.error("Error fetching locations:", error)
    return []
  }
}

export async function getLocationById(id: string) {
  try {
    const query = `
      SELECT 
        id, 
        name,
        created_at,
        updated_at
      FROM 
        locations
      WHERE 
        id = $1
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error)
    return null
  }
}

export async function createLocation(data: {
  name: string
}) {
  try {
    const { name } = data

    const query = `
      INSERT INTO locations (
        name
      ) 
      VALUES ($1)
      RETURNING id
    `

    const result = await executeQuery(query, [name])

    if (!result || result.length === 0) {
      throw new Error("Failed to create location")
    }

    return result[0]
  } catch (error) {
    console.error("Error creating location:", error)
    throw new Error(`Failed to create location: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function updateLocation(
  id: string,
  data: {
    name?: string
  },
) {
  try {
    const { name } = data

    // If no name provided, return early
    if (name === undefined) {
      return { id }
    }

    const query = `
      UPDATE locations
      SET name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `

    const result = await executeQuery(query, [name, id])

    if (!result || result.length === 0) {
      throw new Error(`Location with ID ${id} not found`)
    }

    return result[0]
  } catch (error) {
    console.error(`Error updating location with ID ${id}:`, error)
    throw new Error(`Failed to update location: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function deleteLocation(id: string) {
  try {
    // First check if the location is used in any tours
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM tours
      WHERE location_id = $1
    `

    const checkResult = await executeQuery(checkQuery, [id])

    if (checkResult[0].count > 0) {
      throw new Error("Cannot delete location that is used in tours")
    }

    const query = `
      DELETE FROM locations
      WHERE id = $1
      RETURNING id
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      throw new Error(`Location with ID ${id} not found`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting location with ID ${id}:`, error)
    throw new Error(`Failed to delete location: ${error instanceof Error ? error.message : String(error)}`)
  }
}

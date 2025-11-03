"use server"

import { executeQuery } from "@/lib/db"

export interface Ship {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export async function getAllShips() {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        created_at,
        updated_at
      FROM 
        ships
      ORDER BY 
        name ASC
    `

    const result = await executeQuery(query, [])
    return result
  } catch (error) {
    console.error("Error fetching ships:", error)
    throw new Error(`Failed to fetch ships: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getShipById(id: string) {
  try {
    const ships = await executeQuery(
      `
      SELECT 
        id,
        name,
        capacity,
        created_at
      FROM 
        ships
      WHERE 
        id = $1
      `,
      [id],
    )
    return ships.length > 0 ? ships[0] : null
  } catch (error) {
    console.error("Error fetching ship:", error)
    return null
  }
}

// Create a new ship
export async function createShip(name: string) {
  try {
    const query = `
      INSERT INTO ships (name) 
      VALUES ($1)
      RETURNING id, name, created_at, updated_at
    `

    const result = await executeQuery(query, [name])

    if (!result || result.length === 0) {
      throw new Error("Failed to create ship")
    }

    return {
      success: true,
      message: "Ship created successfully",
      ship: result[0],
    }
  } catch (error) {
    console.error("Error creating ship:", error)
    return {
      success: false,
      message: `Failed to create ship: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function updateShip(id: string, name: string) {
  try {
    const query = `
      UPDATE ships
      SET name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, created_at, updated_at
    `

    const result = await executeQuery(query, [name, id])

    if (!result || result.length === 0) {
      throw new Error(`Ship with ID ${id} not found`)
    }

    return {
      success: true,
      message: "Ship updated successfully",
      ship: result[0],
    }
  } catch (error) {
    console.error(`Error updating ship with ID ${id}:`, error)
    return {
      success: false,
      message: `Failed to update ship: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deleteShip(id: string) {
  try {
    // First check if the ship is used in any booking_tours
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM booking_tours
      WHERE ship_id = $1
    `

    const checkResult = await executeQuery(checkQuery, [id])

    if (checkResult[0].count > 0) {
      return {
        success: false,
        message: "Cannot delete ship that is used in bookings",
      }
    }

    const query = `
      DELETE FROM ships
      WHERE id = $1
      RETURNING id
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      return {
        success: false,
        message: `Ship with ID ${id} not found`,
      }
    }

    return {
      success: true,
      message: "Ship deleted successfully",
    }
  } catch (error) {
    console.error(`Error deleting ship with ID ${id}:`, error)
    return {
      success: false,
      message: `Failed to delete ship: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Add the getShips export at the end of the file

export async function getShips() {
  try {
    const ships = await executeQuery(
      `
      SELECT 
        id,
        name,
        capacity,
        created_at
      FROM 
        ships
      ORDER BY 
        name ASC
      `,
      [],
    )
    return ships
  } catch (error) {
    console.error("Error fetching ships:", error)
    return []
  }
}

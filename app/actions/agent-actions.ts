"use server"

import { executeQuery } from "@/lib/db"

export async function getAllAgents() {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        created_at,
        updated_at
      FROM 
        booking_agents
      ORDER BY 
        name ASC
    `

    const result = await executeQuery(query, [])
    return result
  } catch (error) {
    console.error("Error fetching booking agents:", error)
    return []
  }
}

export async function getAgentById(id: string) {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        created_at,
        updated_at
      FROM 
        booking_agents
      WHERE 
        id = $1
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error(`Error fetching booking agent with ID ${id}:`, error)
    return null
  }
}

export async function createAgent(data: {
  name: string
}) {
  try {
    const { name } = data

    const query = `
      INSERT INTO booking_agents (
        name
      ) 
      VALUES ($1)
      RETURNING id
    `

    const result = await executeQuery(query, [name])

    if (!result || result.length === 0) {
      throw new Error("Failed to create booking agent")
    }

    return result[0]
  } catch (error) {
    console.error("Error creating booking agent:", error)
    throw new Error(`Failed to create booking agent: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function updateAgent(
  id: string,
  data: {
    name?: string
  },
) {
  try {
    const { name } = data

    if (!name) {
      return { id }
    }

    const query = `
      UPDATE booking_agents
      SET name = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `

    const result = await executeQuery(query, [name, id])

    if (!result || result.length === 0) {
      throw new Error(`Booking agent with ID ${id} not found`)
    }

    return result[0]
  } catch (error) {
    console.error(`Error updating booking agent with ID ${id}:`, error)
    throw new Error(`Failed to update booking agent: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function deleteAgent(id: string) {
  try {
    // First check if the agent is used in any bookings
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM booking_tours
      WHERE booking_agent_id = $1
    `

    const checkResult = await executeQuery(checkQuery, [id])

    if (checkResult[0].count > 0) {
      throw new Error("Cannot delete booking agent that is used in bookings")
    }

    const query = `
      DELETE FROM booking_agents
      WHERE id = $1
      RETURNING id
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      throw new Error(`Booking agent with ID ${id} not found`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting booking agent with ID ${id}:`, error)
    throw new Error(`Failed to delete booking agent: ${error instanceof Error ? error.message : String(error)}`)
  }
}

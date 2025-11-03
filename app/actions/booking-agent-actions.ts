"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBookingAgents() {
  try {
    const agents = await executeQuery(
      `
      SELECT 
        id,
        name,
        created_at
      FROM 
        booking_agents
      ORDER BY 
        name ASC
      `,
      [],
    )
    return agents
  } catch (error) {
    console.error("Error fetching booking agents:", error)
    return []
  }
}

export async function getBookingAgentById(id: string) {
  try {
    const agents = await executeQuery(
      `
      SELECT 
        id,
        name,
        created_at
      FROM 
        booking_agents
      WHERE 
        id = $1
      `,
      [id],
    )
    return agents.length > 0 ? agents[0] : null
  } catch (error) {
    console.error("Error fetching booking agent:", error)
    return null
  }
}

export async function createBookingAgent(formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: "Agent name is required",
      }
    }

    // Check if agent with same name already exists
    const existingAgents = await executeQuery(`SELECT id FROM booking_agents WHERE LOWER(name) = LOWER($1)`, [
      name.trim(),
    ])

    if (existingAgents.length > 0) {
      return {
        success: false,
        message: "An agent with this name already exists",
      }
    }

    // Create new agent
    const result = await executeQuery(
      `
      INSERT INTO booking_agents (name, created_at)
      VALUES ($1, NOW())
      RETURNING id
      `,
      [name.trim()],
    )

    // Revalidate the agents page
    revalidatePath("/dashboard/agents")

    return {
      success: true,
      message: "Booking agent created successfully",
      agentId: result[0].id,
    }
  } catch (error) {
    console.error("Error creating booking agent:", error)
    return {
      success: false,
      message: "Failed to create booking agent",
    }
  }
}

export async function updateBookingAgent(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: "Agent name is required",
      }
    }

    // Check if agent exists
    const existingAgent = await executeQuery(`SELECT id FROM booking_agents WHERE id = $1`, [id])

    if (existingAgent.length === 0) {
      return {
        success: false,
        message: "Agent not found",
      }
    }

    // Check if another agent with same name already exists
    const duplicateAgents = await executeQuery(
      `SELECT id FROM booking_agents WHERE LOWER(name) = LOWER($1) AND id != $2`,
      [name.trim(), id],
    )

    if (duplicateAgents.length > 0) {
      return {
        success: false,
        message: "An agent with this name already exists",
      }
    }

    // Update agent
    await executeQuery(
      `
      UPDATE booking_agents 
      SET name = $1
      WHERE id = $2
      `,
      [name.trim(), id],
    )

    // Revalidate the agents page
    revalidatePath("/dashboard/agents")

    return {
      success: true,
      message: "Booking agent updated successfully",
    }
  } catch (error) {
    console.error("Error updating booking agent:", error)
    return {
      success: false,
      message: "Failed to update booking agent",
    }
  }
}

export async function deleteBookingAgent(id: string) {
  try {
    // Check if agent exists
    const existingAgent = await executeQuery(`SELECT id FROM booking_agents WHERE id = $1`, [id])

    if (existingAgent.length === 0) {
      return {
        success: false,
        message: "Agent not found",
      }
    }

    // For now, allow deletion without checking references since we're not sure of the exact schema
    // In a production environment, you would want to check for foreign key constraints
    console.log(`Attempting to delete booking agent with id: ${id}`)

    // Delete agent
    await executeQuery(`DELETE FROM booking_agents WHERE id = $1`, [id])

    // Revalidate the agents page
    revalidatePath("/dashboard/agents")

    return {
      success: true,
      message: "Booking agent deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting booking agent:", error)

    // Check if it's a foreign key constraint error
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (
      errorMessage.toLowerCase().includes("foreign key") ||
      errorMessage.toLowerCase().includes("constraint") ||
      errorMessage.toLowerCase().includes("referenced")
    ) {
      return {
        success: false,
        message: "Cannot delete agent as it is being used in existing bookings",
      }
    }

    return {
      success: false,
      message: "Failed to delete booking agent",
    }
  }
}

"use server"

import { safeExecuteQuery } from "@/lib/db"

// Get all booking agents for display purposes
export async function getBookingAgents() {
  try {
    console.log("Fetching booking agents from booking_agents table...")

    const bookingAgents = await safeExecuteQuery(
      `
      SELECT 
        id,
        name,
        created_at,
        updated_at
      FROM 
        booking_agents
      ORDER BY 
        name ASC
      `,
      [],
      { useCache: true, timeout: 5000, retries: 1 },
    )

    if (bookingAgents && bookingAgents.length > 0) {
      console.log(`Found ${bookingAgents.length} booking agents`)
      return bookingAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        email: "",
        phone: "",
        commission_rate: 0,
        status: "active",
      }))
    }

    console.log("No booking agents found in database")
    return []
  } catch (error) {
    console.error("Error fetching booking agents:", error)
    return []
  }
}

// Get agent name by ID
export async function getAgentNameById(agentId: string | null): Promise<string> {
  if (!agentId) {
    return "Direct Booking"
  }

  try {
    const bookingAgents = await safeExecuteQuery(
      `
      SELECT name FROM booking_agents WHERE id = $1
      `,
      [agentId],
      { useCache: true, timeout: 5000, retries: 1 },
    )

    if (bookingAgents && bookingAgents.length > 0) {
      return bookingAgents[0].name
    }

    return "Unknown Agent"
  } catch (error) {
    console.error("Error fetching agent name:", error)
    return "Unknown Agent"
  }
}

// Find agent ID by name (for form submissions)
export async function findAgentIdByName(agentName: string | null): Promise<string | null> {
  if (!agentName || agentName.toLowerCase() === "direct booking") {
    return null
  }

  try {
    const bookingAgents = await safeExecuteQuery(
      `
      SELECT id FROM booking_agents 
      WHERE LOWER(name) = LOWER($1)
      `,
      [agentName.trim()],
      { useCache: true, timeout: 5000, retries: 1 },
    )

    if (bookingAgents && bookingAgents.length > 0) {
      return bookingAgents[0].id
    }

    return null
  } catch (error) {
    console.error("Error finding agent by name:", error)
    return null
  }
}

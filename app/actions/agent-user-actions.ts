"use server"

import { executeQuery } from "@/lib/db"
import { sendAgentWelcomeEmail } from "@/lib/email-utils"

export interface AgentUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export async function getAllAgentUsers() {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        email, 
        role,
        created_at,
        updated_at
      FROM 
        users
      WHERE 
        role = 'agent'
      ORDER BY 
        name ASC
    `

    const result = await executeQuery(query, [])
    return result
  } catch (error) {
    console.error("Error fetching agent users:", error)
    return []
  }
}

export async function createAgentUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const notifyByEmail = formData.get("notifyByEmail") === "true"

    console.log("🔧 Creating agent user with data:", { name, email, notifyByEmail })

    if (!name || !email || !password) {
      return {
        success: false,
        message: "Name, email, and password are required",
      }
    }

    // Check if email already exists
    const existingUserQuery = `
      SELECT id FROM users WHERE email = $1
    `
    const existingUser = await executeQuery(existingUserQuery, [email])

    if (existingUser.length > 0) {
      return {
        success: false,
        message: "Email already exists",
      }
    }

    const query = `
      INSERT INTO users (
        name, 
        email, 
        password, 
        role
      ) 
      VALUES ($1, $2, $3, 'agent')
      RETURNING id
    `

    const result = await executeQuery(query, [name, email, password])

    if (!result || result.length === 0) {
      throw new Error("Failed to create agent user")
    }

    console.log("✅ Agent user created successfully in database with ID:", result[0].id)

    // Send welcome email to the new agent if checkbox is checked
    if (notifyByEmail) {
      console.log("📧 Sending welcome email to:", email)
      try {
        const emailResult = await sendAgentWelcomeEmail(email, {
          name,
          email,
          password
        })

        if (emailResult.success) {
          console.log("✅ Agent welcome email sent successfully!")
          console.log("📧 Email ID:", emailResult.emailId)
          console.log("📧 Email details:", { to: email, subject: "Benvenuto a Viaggi Del Qatar - Credenziali Account" })
        } else {
          console.error("❌ Failed to send agent welcome email")
          console.error("📧 Error details:", emailResult.error)
          // Don't fail the account creation if email fails
        }
      } catch (emailError) {
        console.error("💥 Error sending agent welcome email:", emailError)
        console.error("📧 Error stack:", emailError instanceof Error ? emailError.stack : "No stack trace")
        // Don't fail the account creation if email fails
      }
    } else {
      console.log("📧 Email notification skipped (checkbox unchecked)")
    }

    return {
      success: true,
      message: "Agent user created successfully",
      userId: result[0].id,
    }
  } catch (error) {
    console.error("Error creating agent user:", error)
    return {
      success: false,
      message: `Failed to create agent user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function updateAgentUser(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email) {
      return {
        success: false,
        message: "Name and email are required",
      }
    }

    // Check if email already exists for other users
    const existingUserQuery = `
      SELECT id FROM users WHERE email = $1 AND id != $2
    `
    const existingUser = await executeQuery(existingUserQuery, [email, id])

    if (existingUser.length > 0) {
      return {
        success: false,
        message: "Email already exists",
      }
    }

    let query: string
    let params: any[]

    if (password) {
      query = `
        UPDATE users
        SET name = $1, email = $2, password = $3, updated_at = NOW()
        WHERE id = $4 AND role = 'agent'
        RETURNING id
      `
      params = [name, email, password, id]
    } else {
      query = `
        UPDATE users
        SET name = $1, email = $2, updated_at = NOW()
        WHERE id = $3 AND role = 'agent'
        RETURNING id
      `
      params = [name, email, id]
    }

    const result = await executeQuery(query, params)

    if (!result || result.length === 0) {
      throw new Error(`Agent user with ID ${id} not found`)
    }

    return {
      success: true,
      message: "Agent user updated successfully",
    }
  } catch (error) {
    console.error(`Error updating agent user with ID ${id}:`, error)
    return {
      success: false,
      message: `Failed to update agent user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deleteAgentUser(id: string) {
  try {
    // Check if the user exists first
    const userCheckQuery = `
      SELECT id FROM users WHERE id = $1 AND role = 'agent'
    `
    const userCheckResult = await executeQuery(userCheckQuery, [id])

    if (!userCheckResult || userCheckResult.length === 0) {
      return {
        success: false,
        message: "Agent user not found",
      }
    }

    // Delete the user directly (removed dependency check for now)
    const query = `
      DELETE FROM users
      WHERE id = $1 AND role = 'agent'
      RETURNING id
    `

    const result = await executeQuery(query, [id])

    if (!result || result.length === 0) {
      return {
        success: false,
        message: "Failed to delete agent user",
      }
    }

    return {
      success: true,
      message: "Agent user deleted successfully",
    }
  } catch (error) {
    console.error(`Error deleting agent user with ID ${id}:`, error)
    return {
      success: false,
      message: `Failed to delete agent user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

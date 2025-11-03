"use server"

import { executeQuery } from "@/lib/db"

export async function searchCustomers(searchTerm: string) {
  try {
    if (!searchTerm || searchTerm.trim() === "") {
      return []
    }

    const searchTermLike = `%${searchTerm}%`

    const customers = await executeQuery(
      `
      SELECT 
        id, 
        name, 
        email, 
        phone
      FROM 
        customers
      WHERE
        name ILIKE $1 OR
        email ILIKE $1 OR
        phone ILIKE $1
      ORDER BY 
        name ASC
      LIMIT 20
    `,
      [searchTermLike],
    )

    return customers
  } catch (error) {
    console.error("Error searching customers:", error)
    return []
  }
}

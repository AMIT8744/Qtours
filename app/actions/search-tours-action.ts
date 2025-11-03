"use server"

import { executeQuery } from "@/lib/db"

export async function searchTours(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const searchTerm = `%${query.toLowerCase()}%`

    const tours = await executeQuery(
      `
      SELECT 
        t.id, 
        t.name, 
        t.description,
        t.price,
        t.status,
        t.capacity,
        t.duration,
        s.name as ship_name,
        l.name as location,
        COALESCE(
          (SELECT COUNT(*) FROM booking_tours bt WHERE bt.tour_id = t.id), 
          0
        ) as booking_count
      FROM 
        tours t
      LEFT JOIN 
        ships s ON t.ship_id = s.id
      LEFT JOIN 
        locations l ON t.location_id = l.id
      WHERE 
        LOWER(t.name) LIKE $1 OR
        LOWER(s.name) LIKE $1 OR
        LOWER(l.name) LIKE $1 OR
        LOWER(t.description) LIKE $1
      ORDER BY 
        t.name ASC
      LIMIT 10
      `,
      [searchTerm],
    )

    return tours
  } catch (error) {
    console.error("Error searching tours:", error)
    return []
  }
}

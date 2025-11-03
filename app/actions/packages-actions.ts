"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export interface Package {
  id: number
  name: string
  description: string
  cruise_line: string
  excursions_count: number
  adult_price: number
  child_price: number
  is_popular: boolean
  color_scheme: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getPackages(): Promise<Package[]> {
  try {
    const result = await executeQuery(
      "SELECT * FROM packages WHERE is_active = true ORDER BY sort_order ASC, id ASC",
      [],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )
    
    return result || []
  } catch (error) {
    console.error("Error fetching packages:", error)
    return []
  }
}

export async function getAllPackages(): Promise<Package[]> {
  try {
    const result = await executeQuery(
      "SELECT * FROM packages ORDER BY sort_order ASC, id ASC",
      [],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )
    
    return result || []
  } catch (error) {
    console.error("Error fetching all packages:", error)
    return []
  }
}

export async function getPackageById(id: number): Promise<Package | null> {
  try {
    const result = await executeQuery(
      "SELECT * FROM packages WHERE id = $1",
      [id],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )
    
    return result && result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error fetching package by ID:", error)
    return null
  }
}

export async function createPackage(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const cruise_line = formData.get("cruise_line") as string
    const excursions_count = parseInt(formData.get("excursions_count") as string)
    const adult_price = parseFloat(formData.get("adult_price") as string)
    const child_price = parseFloat(formData.get("child_price") as string)
    const is_popular = formData.get("is_popular") === "true"
    const color_scheme = formData.get("color_scheme") as string
    const sort_order = parseInt(formData.get("sort_order") as string) || 0
    const is_active = formData.get("is_active") === "true"

    if (!name || !description || !cruise_line || !excursions_count || !adult_price || !child_price) {
      return { success: false, message: "All fields are required" }
    }

    const result = await executeQuery(
      `INSERT INTO packages (name, description, cruise_line, excursions_count, adult_price, child_price, is_popular, color_scheme, sort_order, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [name, description, cruise_line, excursions_count, adult_price, child_price, is_popular, color_scheme, sort_order, is_active],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    if (!result || result.length === 0) {
      throw new Error("Failed to create package")
    }

    revalidatePath("/dashboard/packages")
    revalidatePath("/")

    return {
      success: true,
      message: "Package created successfully",
      packageId: result[0].id,
    }
  } catch (error) {
    console.error("Error creating package:", error)
    return {
      success: false,
      message: `Failed to create package: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function updatePackage(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const cruise_line = formData.get("cruise_line") as string
    const excursions_count = parseInt(formData.get("excursions_count") as string)
    const adult_price = parseFloat(formData.get("adult_price") as string)
    const child_price = parseFloat(formData.get("child_price") as string)
    const is_popular = formData.get("is_popular") === "true"
    const color_scheme = formData.get("color_scheme") as string
    const sort_order = parseInt(formData.get("sort_order") as string) || 0
    const is_active = formData.get("is_active") === "true"

    if (!name || !description || !cruise_line || !excursions_count || !adult_price || !child_price) {
      return { success: false, message: "All fields are required" }
    }

    const result = await executeQuery(
      `UPDATE packages 
       SET name = $1, description = $2, cruise_line = $3, excursions_count = $4, adult_price = $5, child_price = $6, 
           is_popular = $7, color_scheme = $8, sort_order = $9, is_active = $10, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $11 RETURNING id`,
      [name, description, cruise_line, excursions_count, adult_price, child_price, is_popular, color_scheme, sort_order, is_active, id],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    if (!result || result.length === 0) {
      throw new Error("Failed to update package")
    }

    revalidatePath("/dashboard/packages")
    revalidatePath("/")

    return {
      success: true,
      message: "Package updated successfully",
    }
  } catch (error) {
    console.error("Error updating package:", error)
    return {
      success: false,
      message: `Failed to update package: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function deletePackage(id: number) {
  try {
    const result = await executeQuery(
      "DELETE FROM packages WHERE id = $1 RETURNING id",
      [id],
      { useCache: false, retries: 2, useMockOnFailure: true }
    )

    if (!result || result.length === 0) {
      throw new Error("Failed to delete package")
    }

    revalidatePath("/dashboard/packages")
    revalidatePath("/")

    return {
      success: true,
      message: "Package deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting package:", error)
    return {
      success: false,
      message: `Failed to delete package: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
} 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with Euro symbol
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value)
  return isNaN(num) ? "€0.00" : `€${num.toFixed(2)}`
}

/**
 * Formats a number with commas for thousands
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | string | null | undefined): string {
  const num = Number(value)
  return isNaN(num) ? "0" : num.toString()
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Safely executes a database query with error handling and timeout
 * @param queryFn - Function that returns a promise with the query result
 * @param fallbackValue - Value to return if query fails
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise with query result or fallback value
 */
export async function safeExecuteQuery<T>(queryFn: () => Promise<T>, fallbackValue: T, timeoutMs = 10000): Promise<T> {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), timeoutMs)
    })

    // Race between the query and timeout
    const result = await Promise.race([queryFn(), timeoutPromise])
    return result
  } catch (error) {
    console.error("Database query failed:", error)
    return fallbackValue
  }
}

/**
 * Executes a database query with basic error handling
 * @param queryFn - Function that returns a promise with the query result
 * @returns Promise with query result or throws error
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

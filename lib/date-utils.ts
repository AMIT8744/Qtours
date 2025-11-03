/**
 * Utility functions for date handling and formatting
 */

/**
 * Gets the current date at midnight in local timezone
 * @returns Date object set to midnight of the current day
 */
export function getTodayAtMidnight(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Formats a date to YYYY-MM-DD format for SQL queries
 * @param date - The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForSQL(date: Date): string {
  // Use local date components to avoid timezone issues
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Safely formats a date string to YYYY-MM-DD format
 * @param dateValue - The date value to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateToYYYYMMDD(dateValue: any): string {
  if (!dateValue) return ""

  try {
    // If it's already a string in ISO format
    if (typeof dateValue === "string") {
      // Handle ISO format strings (with or without time)
      if (dateValue.includes("T")) {
        return dateValue.split("T")[0]
      }
      // Handle YYYY-MM-DD format directly
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateValue
      }
    }

    // Convert to Date object and then to YYYY-MM-DD
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`)
      return ""
    }

    // Use local date components to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error(`Error formatting date ${dateValue}:`, error)
    return ""
  }
}

/**
 * Checks if a date is today
 * @param dateString - The date string to check
 * @returns Boolean indicating if the date is today
 */
export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false

    const today = getTodayAtMidnight()

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  } catch (error) {
    console.error(`Error checking if date is today: ${dateString}`, error)
    return false
  }
}

/**
 * Checks if a date is within a specified number of days from today
 * @param dateString - The date string to check
 * @param days - Number of days from today
 * @param includeToday - Whether to include today in the range
 * @returns Boolean indicating if the date is within the specified days
 */
export function isWithinDays(dateString: string | null | undefined, days: number, includeToday = false): boolean {
  if (!dateString) return false

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false

    const today = getTodayAtMidnight()

    // If we don't include today, start from tomorrow
    const startDate = new Date(today)
    if (!includeToday) {
      startDate.setDate(today.getDate() + 1)
    }

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + days)

    // Set both dates to midnight for accurate comparison
    date.setHours(0, 0, 0, 0)

    return date >= startDate && date <= endDate
  } catch (error) {
    console.error(`Error checking if date is within ${days} days: ${dateString}`, error)
    return false
  }
}

/**
 * Safely formats a date string to a human-readable format
 * @param dateString - The date string to format
 * @param fallback - The fallback value if the date is invalid
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string | null | undefined, fallback = "No date"): string {
  if (!dateString) return fallback

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`)
      return fallback
    }

    const day = date.getDate().toString().padStart(2, "0")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return fallback
  }
}

/**
 * Safely parses a date string to a Date object
 * @param dateString - The date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null

  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch (error) {
    console.error(`Error parsing date ${dateString}:`, error)
    return null
  }
}

/**
 * Safely formats a date string to a localized date string
 * @param dateString - The date string to format
 * @param fallback - The fallback value if the date is invalid
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null | undefined, fallback = "No date"): string {
  return formatDateForDisplay(dateString, fallback)
}

/**
 * NEW: Diagnostic function to check what date format the app is using
 */
export function getAppDateFormat(): string {
  // Based on the existing functions, the app uses:
  // - YYYY-MM-DD for SQL queries (formatDateForSQL, formatDateToYYYYMMDD)
  // - DD MMM YYYY for display (formatDateForDisplay)
  return "YYYY-MM-DD"
}

/**
 * NEW: Convert any date format to the app's standard format
 */
export function normalizeToAppFormat(dateValue: any): string {
  return formatDateToYYYYMMDD(dateValue)
}

/**
 * NEW: Check if a date string matches the app's expected format
 */
export function isValidAppDateFormat(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
}

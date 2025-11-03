/**
 * Global error handling utilities
 */

// Log error to console with additional context
export function logError(error: Error, context?: Record<string, any>) {
  console.error("Application error:", error.message)
  console.error("Error stack:", error.stack)

  if (context) {
    console.error("Error context:", context)
  }

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

// Format error message for display
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "An unknown error occurred"
}

// Check if error is related to database
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("database") ||
      message.includes("sql") ||
      message.includes("query") ||
      message.includes("relation") ||
      message.includes("table") ||
      message.includes("column")
    )
  }

  return false
}

// Check if error is related to network
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("offline")
    )
  }

  return false
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandlers() {
  if (typeof window !== "undefined") {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        reason: event.reason,
      })
    })

    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      logError(new Error(`Uncaught Error: ${event.message}`), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })
  }
}

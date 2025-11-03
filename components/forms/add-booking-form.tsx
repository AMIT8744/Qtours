"use client"

import type React from "react"

// Import the original AddBookingForm component
import OriginalAddBookingForm from "@/components/add-booking-form"

// Re-export the component with the same props
export function AddBookingForm(props: React.ComponentProps<typeof OriginalAddBookingForm>) {
  return <OriginalAddBookingForm {...props} />
}

// Default export for backward compatibility
export default AddBookingForm

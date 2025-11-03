// This file is used to configure route handling for the bookings section
export const dynamic = "force-dynamic"

// Ensure that the 'add' route takes precedence over the dynamic [id] route
export const routeSegmentConfig = {
  add: {
    // This ensures the 'add' route is matched before the dynamic [id] route
    priority: 1,
  },
}

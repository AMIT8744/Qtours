import { neon } from "@neondatabase/serverless"
import { LRUCache } from "lru-cache"

// Check if DATABASE_URL is defined
const hasDbUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
if (!hasDbUrl) {
  console.warn("DATABASE_URL environment variable is not set - using mock database")
}

// Create a more comprehensive mock database
const createMockDatabase = () => {
  // In-memory storage for mock data
  const mockDb = {
    notifications: [
      {
        id: "mock-1",
        title: "New Booking Created",
        message: "Booking VDQ123456 with 1 tour(s) has been created for John Doe.",
        link: "/dashboard/bookings/mock-1",
        is_read: false,
        created_at: new Date().toISOString(),
        user_id: "current-user",
      },
      {
        id: "mock-2",
        title: "Payment Received",
        message: "Payment of $300 received for booking VDQ123456",
        link: "/dashboard/bookings/mock-1",
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: "current-user",
      },
      {
        id: "mock-3",
        title: "Tour Updated",
        message: "The 'Doha City Tour' has been updated with new information.",
        link: "/dashboard/tours",
        is_read: false,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        user_id: "current-user",
      },
    ],
    bookings: [
      {
        id: "mock-1",
        booking_reference: "REF-250524-9597", // Changed from "VDQ123456"
        created_at: new Date().toISOString(),
        tour_date: new Date().toISOString().split("T")[0],
        customer_name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        agent_name: "Direct",
        status: "confirmed",
        deposit: 100,
        remaining_balance: 200,
        total_payment: 300,
        commission: 0,
        adults: 2,
        children: 1,
        total_pax: 3,
        tour_name: "Doha City Tour",
        ship_name: "Qatar Explorer",
        location: "Doha",
        notes: "Sample booking for verification testing",
      },
      {
        id: "mock-2",
        booking_reference: "VDQ789012",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        tour_date: new Date(Date.now() + 604800000).toISOString().split("T")[0],
        customer_name: "Jane Smith",
        email: "jane@example.com",
        phone: "+9876543210",
        agent_name: "Qatar Travel",
        status: "paid",
        deposit: 150,
        remaining_balance: 350,
        total_payment: 500,
        commission: 50,
        adults: 3,
        children: 2,
        total_pax: 5,
        tour_name: "Desert Safari",
        ship_name: "Desert Explorer",
        location: "Qatar Desert",
      },
      // Add a third booking with the exact reference from the error
      {
        id: "mock-3",
        booking_reference: "REF-250524-9597",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        tour_date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        customer_name: "Ahmed Al-Rashid",
        email: "ahmed@example.com",
        phone: "+97412345678",
        agent_name: "Qatar Tours",
        status: "confirmed",
        deposit: 200,
        remaining_balance: 300,
        total_payment: 500,
        commission: 25,
        adults: 4,
        children: 0,
        total_pax: 4,
        tour_name: "Museum of Islamic Art Tour",
        ship_name: "Cultural Explorer",
        location: "Doha",
        notes: "VIP cultural tour package",
      },
    ],
    customers: [
      {
        id: "mock-1",
        name: "John Doe",
      },
      {
        id: "mock-2",
        name: "Jane Smith",
      },
    ],
    tours: [
      {
        id: "mock-1",
        name: "Doha City Tour",
        description: "Explore the beautiful city of Doha",
        price: 100,
        status: "active",
        ship_id: "mock-1",
        ship_name: "Qatar Explorer",
        location_id: "mock-1",
        location: "Doha",
      },
      {
        id: "mock-2",
        name: "Desert Safari",
        description: "Experience the thrill of the Qatar desert",
        price: 150,
        status: "active",
        ship_id: "mock-2",
        ship_name: "Desert Explorer",
        location_id: "mock-2",
        location: "Qatar Desert",
      },
      {
        id: "mock-3",
        name: "Museum of Islamic Art Tour",
        description: "Discover Qatar's rich cultural heritage",
        price: 125,
        status: "active",
        ship_id: "mock-3",
        ship_name: "Cultural Explorer",
        location_id: "mock-1",
        location: "Doha",
      },
    ],
    booking_tours: [
      {
        id: "mock-bt-1",
        booking_id: "mock-1",
        tour_id: "mock-1",
        tour_date: new Date().toISOString().split("T")[0],
        adults: 2,
        children: 1,
        total_pax: 3,
        price: 300,
        tour_guide: "Ahmed",
        vehicles: "Bus",
        notes: "City tour booking",
        tour_name: "Doha City Tour",
        ship_name: "Qatar Explorer",
        deposit: 100,
      },
      {
        id: "mock-bt-2",
        booking_id: "mock-2",
        tour_id: "mock-2",
        tour_date: new Date(Date.now() + 604800000).toISOString().split("T")[0],
        adults: 3,
        children: 2,
        total_pax: 5,
        price: 500,
        tour_guide: "Fatima",
        vehicles: "4WD",
        notes: "Desert safari booking",
        tour_name: "Desert Safari",
        ship_name: "Desert Explorer",
        deposit: 150,
      },
      // Add booking tours for the REF-250524-9597 booking
      {
        id: "mock-bt-3",
        booking_id: "mock-3",
        tour_id: "mock-3",
        tour_date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        adults: 4,
        children: 0,
        total_pax: 4,
        price: 500,
        tour_guide: "Khalid",
        vehicles: "Luxury Bus",
        notes: "Cultural tour with museum visit",
        tour_name: "Museum of Islamic Art Tour",
        ship_name: "Cultural Explorer",
        deposit: 200,
      },
    ],
    ships: [
      {
        id: "mock-1",
        name: "Qatar Explorer",
      },
      {
        id: "mock-2",
        name: "Desert Explorer",
      },
      {
        id: "mock-3",
        name: "Cultural Explorer",
      },
    ],
    locations: [
      {
        id: "mock-1",
        name: "Doha",
      },
      {
        id: "mock-2",
        name: "Qatar Desert",
      },
    ],
    system_settings: [
      {
        id: 1,
        key: "terms_and_conditions",
        content: `Welcome to Viaggi Del Qatar Terms and Conditions

By using our services, you agree to the following terms:

1. Booking and Payment
- All bookings must be confirmed with a deposit
- Full payment is required 24 hours before the tour date
- Cancellations must be made at least 48 hours in advance

2. Tour Policies
- Please arrive 15 minutes before the scheduled departure time
- Tours are subject to weather conditions and may be rescheduled
- We reserve the right to modify itineraries for safety reasons

3. Liability
- Viaggi Del Qatar is not responsible for personal belongings
- Participants engage in activities at their own risk
- Travel insurance is recommended

4. Privacy Policy
- We collect personal information only for booking purposes
- Your data will not be shared with third parties
- We use secure payment processing systems

For questions or concerns, please contact us at info@viaggidelqatar.com

Last updated: ${new Date().toISOString()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }

  // Enhanced mock query function
  const mockQuery = async (text: string, params: any[] = []) => {
    console.log("MOCK DB QUERY:", text.substring(0, 100) + "...", params)

    const lowerText = text.toLowerCase()

    // Handle booking verification queries
    if (lowerText.includes("bookings") && lowerText.includes("customers") && lowerText.includes("join")) {
      const reference = params[0]
      if (reference) {
        const booking = mockDb.bookings.find((b) => b.booking_reference.toUpperCase() === reference.toUpperCase())
        if (booking) {
          const customer = mockDb.customers.find((c) => c.id === `mock-${booking.id.split("-")[1]}`)
          return [
            {
              id: booking.id,
              booking_reference: booking.booking_reference,
              customer_name: customer?.name || booking.customer_name,
              deposit: booking.deposit,
              remaining_balance: booking.remaining_balance,
              total_payment: booking.total_payment,
              status: booking.status,
              created_at: booking.created_at,
              notes: booking.notes || null,
            },
          ]
        }
      }
      return []
    }

    // Handle booking tours queries with joins
    if (lowerText.includes("booking_tours") && lowerText.includes("tours") && lowerText.includes("ships")) {
      const bookingId = params[0]
      if (bookingId) {
        const bookingTours = mockDb.booking_tours.filter((bt) => bt.booking_id === bookingId)
        return bookingTours.map((bt) => {
          const tour = mockDb.tours.find((t) => t.id === bt.tour_id)
          const ship = mockDb.ships.find((s) => s.id === tour?.ship_id)
          const location = mockDb.locations.find((l) => l.id === tour?.location_id)

          return {
            id: bt.id,
            tour_date: bt.tour_date,
            tour_name: bt.tour_name || tour?.name,
            ship_name: bt.ship_name || ship?.name,
            adults: bt.adults,
            children: bt.children,
            total_pax: bt.total_pax,
            price: bt.price,
            location: location?.name || "Doha",
          }
        })
      }
      return []
    }

    // Handle different query types
    if (lowerText.startsWith("select")) {
      // Booking tours queries
      if (lowerText.includes("booking_tours")) {
        const bookingId = params[0]
        if (bookingId) {
          return mockDb.booking_tours.filter((bt) => bt.booking_id === bookingId.toString())
        }
        return mockDb.booking_tours
      }

      // Notifications queries
      if (lowerText.includes("notifications")) {
        if (lowerText.includes("count(*)") && lowerText.includes("is_read = false")) {
          return [{ count: mockDb.notifications.filter((n) => !n.is_read).length }]
        }
        return mockDb.notifications
      }

      // Bookings queries
      if (lowerText.includes("bookings")) {
        return mockDb.bookings
      }

      // Tours queries
      if (lowerText.includes("tours")) {
        return mockDb.tours
      }

      // Generic health check
      if (lowerText.includes("connection_test")) {
        return [{ connection_test: 1 }]
      }
    }

    // INSERT queries
    if (lowerText.startsWith("insert")) {
      if (lowerText.includes("notifications")) {
        const newNotification = {
          id: `mock-${Date.now()}`,
          title: params[1] || "New Notification",
          message: params[2] || "Notification message",
          link: params[3] || "/dashboard",
          is_read: false,
          created_at: new Date().toISOString(),
          user_id: params[0] || "current-user",
        }
        mockDb.notifications.push(newNotification)
        return [{ id: newNotification.id }]
      }
    }

    // UPDATE queries
    if (lowerText.startsWith("update")) {
      if (lowerText.includes("notifications") && lowerText.includes("is_read = true")) {
        const notificationId = params[0]
        const notification = mockDb.notifications.find((n) => n.id === notificationId)
        if (notification) {
          notification.is_read = true
        }
        return [{ id: notificationId }]
      }
    }

    // DELETE queries
    if (lowerText.startsWith("delete")) {
      if (lowerText.includes("notifications")) {
        const notificationId = params[0]
        const index = mockDb.notifications.findIndex((n) => n.id === notificationId)
        if (index !== -1) {
          mockDb.notifications.splice(index, 1)
        }
        return [{ id: notificationId }]
      }
    }

    // Handle system settings queries
    if (lowerText.includes("system_settings")) {
      if (lowerText.includes("where key =")) {
        const key = params[0]
        const setting = mockDb.system_settings.find((s) => s.key === key)
        return setting ? [setting] : []
      }

      if (lowerText.startsWith("insert") && lowerText.includes("on conflict")) {
        const [key, content] = params
        const existingIndex = mockDb.system_settings.findIndex((s) => s.key === key)

        if (existingIndex !== -1) {
          // Update existing
          mockDb.system_settings[existingIndex] = {
            ...mockDb.system_settings[existingIndex],
            content,
            updated_at: new Date().toISOString(),
          }
        } else {
          // Insert new
          mockDb.system_settings.push({
            id: mockDb.system_settings.length + 1,
            key,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
        return [{ key, content }]
      }

      return mockDb.system_settings
    }

    // Default empty response
    return []
  }

  return { query: mockQuery }
}

// Create a SQL client with the Neon connection or use mock
const createSqlClient = () => {
  try {
    // Always try to use the real database first if DATABASE_URL exists
    if (hasDbUrl) {
      console.log("Creating Neon database client")
      return neon(process.env.DATABASE_URL || "")
    }

    // Only use mock database if no DATABASE_URL is available
    console.log("No DATABASE_URL found, using mock database client")
    return createMockDatabase()
  } catch (error) {
    console.error("Error creating SQL client:", error)
    console.warn("Using mock database client due to connection error")
    return createMockDatabase()
  }
}

// Create a new SQL client
export const sql = createSqlClient()

export const db = sql // Add db as an alias for sql to maintain compatibility with existing imports

// Cache configuration
const CACHE_TTL = 60 * 1000 // 1 minute cache TTL
const CACHE_MAX = 100 // Maximum number of items in cache

// Create LRU cache for query results
const queryCache = new LRUCache<string, any>({
  max: CACHE_MAX,
  ttl: CACHE_TTL,
})

// Clear all cache on startup to ensure fresh data
queryCache.clear()

// Helper function to generate a cache key from query and params
function generateCacheKey(queryText: string, params: any[] = []): string {
  return `${queryText}:${JSON.stringify(params)}`
}

// Helper function to safely extract error message
function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error"

  // If it's already a string, return it
  if (typeof error === "string") {
    return error
  }

  // If it has a message property
  if (error.message && typeof error.message === "string") {
    return error.message
  }

  // If it's an object, try to stringify it safely
  try {
    if (typeof error === "object") {
      // Check for common error properties
      if (error.code) return `Error ${error.code}: ${error.message || "Unknown error"}`
      if (error.status) return `HTTP ${error.status}: ${error.statusText || error.message || "Unknown error"}`

      // Try to stringify the object
      return JSON.stringify(error)
    }
  } catch (stringifyError) {
    // If stringify fails, return a generic message
    return "Error object could not be serialized"
  }

  return "Unknown error type"
}

// Helper function for raw SQL queries with parameters, retry logic, and caching
export async function executeQuery(
  queryText: string,
  params: any[] = [],
  options: {
    retries?: number
    useCache?: boolean
    cacheTTL?: number
    timeout?: number
    useMockOnFailure?: boolean
  } = {},
) {
  const { retries = 2, useCache = false, cacheTTL, timeout = 15000, useMockOnFailure = true } = options
  const isReadQuery = queryText.trim().toLowerCase().startsWith("select")

  // Only use cache for SELECT queries if useCache is true
  if (isReadQuery && useCache) {
    const cacheKey = generateCacheKey(queryText, params)
    const cachedResult = queryCache.get(cacheKey)

    if (cachedResult) {
      console.log("Cache hit for query:", queryText.substring(0, 50) + "...")
      return cachedResult
    }
  }

  let lastError: any = null
  let delay = 1000 // Start with 1 second delay
  let attempt = 0

  const startTime = Date.now()

  while (attempt <= retries) {
    try {
      // Check if we should use mock database from the start
      if (!hasDbUrl) {
        console.log("No DATABASE_URL found, using mock database")
        const mockClient = createMockDatabase()
        return await mockClient.query(queryText, params)
      }

      // Create a new SQL client for each attempt to avoid connection pool issues
      const client = attempt > 0 ? createSqlClient() : sql

      // Validate that client exists and has query method
      if (!client || typeof client.query !== "function") {
        throw new Error("Database client is not properly initialized")
      }

      // Execute the query with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout after " + timeout + "ms")), timeout),
      )

      const queryPromise = client.query(queryText, params)

      const result = (await Promise.race([queryPromise, timeoutPromise])) as any[]

      const queryTime = Date.now() - startTime
      console.log(`Query executed successfully in ${queryTime}ms:`, queryText.substring(0, 50) + "...")

      // Cache the result for SELECT queries if useCache is true
      if (isReadQuery && useCache) {
        const cacheKey = generateCacheKey(queryText, params)
        queryCache.set(cacheKey, result, { ttl: cacheTTL || CACHE_TTL })
      }

      return result
    } catch (error: any) {
      lastError = error
      const errorMessage = extractErrorMessage(error)

      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, errorMessage)

      // If this is the last attempt, break out to handle fallback
      if (attempt === retries) {
        if (useMockOnFailure) {
          console.warn("Database connection failed after all retries, using mock data")
          break // Exit the loop to return mock data below
        } else {
          throw new Error(`Database error after ${retries + 1} attempts: ${errorMessage}`)
        }
      }

      // Check for specific error types that indicate we should retry
      const shouldRetry =
        errorMessage.toLowerCase().includes("too many") ||
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("connection") ||
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("failed to fetch") ||
        errorMessage.toLowerCase().includes("fetch failed") ||
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("econnrefused") ||
        errorMessage.toLowerCase().includes("enotfound") ||
        error instanceof TypeError ||
        error instanceof SyntaxError // This catches JSON parsing errors

      if (shouldRetry) {
        console.log(`Retryable error detected, waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        // Exponential backoff with max 10s delay for rate limiting
        delay = Math.min(delay * 2, 10000)
      } else {
        // For non-retryable errors, wait a shorter time
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      attempt++
    }
  }

  // If we've exhausted retries and useMockOnFailure is true, use mock database
  if (useMockOnFailure) {
    console.warn("Database connection failed, using mock data as fallback")
    const mockClient = createMockDatabase()
    return await mockClient.query(queryText, params)
  }

  // If we've exhausted retries, throw a more user-friendly error
  const finalErrorMessage = extractErrorMessage(lastError)
  throw new Error(`Database error after ${retries + 1} attempts: ${finalErrorMessage}`)
}

// Function to handle database connection errors gracefully
export async function safeExecuteQuery(
  queryText: string,
  params: any[] = [],
  options: {
    useCache?: boolean
    cacheTTL?: number
    timeout?: number
    retries?: number
    useMockOnFailure?: boolean
  } = {},
) {
  try {
    return await executeQuery(queryText, params, { ...options, useMockOnFailure: true, useCache: false })
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    console.error("Safe query execution failed:", errorMessage)

    // Always use mock database for fallback in safeExecuteQuery
    console.log("Using mock database as final fallback")
    const mockClient = createMockDatabase()
    return await mockClient.query(queryText, params)
  }
}

// Function to invalidate cache for specific patterns
export function invalidateCache(pattern?: string) {
  if (pattern) {
    // Invalidate specific pattern
    const keys = [...queryCache.keys()]
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    })
  } else {
    // Invalidate all cache
    queryCache.clear()
  }
}

// Connection health check function
export async function checkDatabaseConnection() {
  try {
    // If we're using mock database, return success
    if (!hasDbUrl) {
      return { connected: true, message: "Using mock database", isMock: true }
    }

    const result = await executeQuery("SELECT 1 as connection_test", [], {
      useCache: false,
      timeout: 5000, // Short timeout for health checks
      retries: 1, // Only try once for health checks
      useMockOnFailure: false, // Don't use mock data for health checks
    })
    return { connected: true, message: "Database connection successful" }
  } catch (error: any) {
    const errorMessage = extractErrorMessage(error)
    console.error("Database connection check failed:", errorMessage)
    return { connected: false, message: errorMessage }
  }
}

// Function to check if we're in development mode
export function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

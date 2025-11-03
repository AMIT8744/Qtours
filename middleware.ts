import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the user is authenticated for protected routes
  if (path.startsWith("/dashboard")) {
    const authenticated = request.cookies.has("authenticated") && request.cookies.get("authenticated")?.value === "true"

    // Also check for user_id as a fallback
    const hasUserId = request.cookies.has("user_id")

    // Check for session cookie
    const hasSession = request.cookies.has("session")

    // Log for debugging
    console.log(
      `Middleware check: path=${path}, authenticated=${authenticated}, hasUserId=${hasUserId}, hasSession=${hasSession}`,
    )

    if (!authenticated && !hasUserId && !hasSession) {
      // Redirect to login page if not authenticated
      console.log("User not authenticated, redirecting to login")
      const loginUrl = new URL("/", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Special handling for the /dashboard/bookings/add route
  if (path === "/dashboard/bookings/add") {
    // Allow this route to pass through without being caught by the dynamic [id] route
    return NextResponse.next()
  }

  // Continue with normal processing for all other routes
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/dashboard/:path*"],
}

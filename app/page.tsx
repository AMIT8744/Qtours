import { Suspense } from "react"
import { getTours } from "@/app/actions/tour-actions"
import LandingPageClient from "./landing-page-client"

// Simple loading component
function ToursLoading() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50" id="tours">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Loading tours...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function LandingPage() {
  let tours = []

  try {
    tours = (await getTours()) || []
  } catch (error) {
    console.error("Failed to fetch tours:", error)
    tours = []
  }

  return (
    <Suspense fallback={<ToursLoading />}>
      <LandingPageClient initialTours={tours} />
    </Suspense>
  )
}

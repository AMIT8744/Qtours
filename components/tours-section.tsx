"use client"

import { useState } from "react"
import Link from "next/link"
import { Ship } from "lucide-react"

interface ToursSectionProps {
  language: "en" | "it" | "es" | "de"
  initialTours: Tour[]
}

interface Tour {
  id: string
  name: string
  description?: string
  description_it?: string
  description_en?: string
  description_es?: string
  description_de?: string
  price: number
  children_price?: number
  location?: string
  location_name?: string
  duration?: string
  capacity?: number
  images?: string[]
  ship?: string
  status: string
}

export function ToursSection({ language, initialTours }: ToursSectionProps) {
  const [tours] = useState<Tour[]>(initialTours)

  const translations = {
    en: {
      trendingAdventures: "Trending Excursions",
      seeDeals: "See deals",
      from: "From",
      hours: "hours",
      active: "ACTIVE",
      inactive: "INACTIVE",
      noTours: "No tours available at the moment",
      loading: "Loading tours...",
      contactForPrice: "Contact for price",
      adult: "Adult",
      children: "Children",
    },
    it: {
      trendingAdventures: "Escursioni di Tendenza",
      seeDeals: "Vedi offerte",
      from: "Da",
      hours: "ore",
      active: "ATTIVO",
      inactive: "INATTIVO",
      noTours: "Nessun tour disponibile al momento",
      loading: "Caricamento tour...",
      contactForPrice: "Contatta per prezzo",
      adult: "Adulto",
      children: "Bambini",
    },
    es: {
      trendingAdventures: "Excursiones Populares",
      seeDeals: "Ver ofertas",
      from: "Desde",
      hours: "horas",
      active: "ACTIVO",
      inactive: "INACTIVO",
      noTours: "No hay tours disponibles en este momento",
      loading: "Cargando tours...",
      contactForPrice: "Contactar para precio",
      adult: "Adulto",
      children: "Niños",
    },
    de: {
      trendingAdventures: "Beliebte Ausflüge",
      seeDeals: "Angebote ansehen",
      from: "Ab",
      hours: "Stunden",
      active: "AKTIV",
      inactive: "INAKTIV",
      noTours: "Derzeit sind keine Touren verfügbar",
      loading: "Touren werden geladen...",
      contactForPrice: "Für Preis kontaktieren",
      adult: "Erwachsene",
      children: "Kinder",
    },
  }

  const t = translations[language]

  // Function to get tour images - now returns multiple images for carousel
  const getTourImages = (tour: Tour): string[] => {
    const images: string[] = []

    // If tour has uploaded images, use them
    if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
      images.push(...tour.images)
    }

    // Add default images based on tour name/location for variety
    const name = tour.name?.toLowerCase() || ""
    const location = (tour.location || tour.location_name || "")?.toLowerCase() || ""

    if (name.includes("abu dhabi")) {
      images.push("/vast-desert-landscape.png", "/museum-interior.png", "/vibrant-cityscape.png")
    } else if (name.includes("dubai")) {
      images.push("/vibrant-cityscape.png", "/vast-desert-landscape.png", "/museum-interior.png")
    } else if (name.includes("doha")) {
      images.push("/museum-interior.png", "/vibrant-cityscape.png", "/vast-desert-landscape.png")
    } else if (name.includes("manama")) {
      images.push("/vibrant-cityscape.png", "/museum-interior.png", "/vast-desert-landscape.png")
    } else if (name.includes("muscat")) {
      images.push("/museum-interior.png", "/vast-desert-landscape.png", "/vibrant-cityscape.png")
    } else if (name.includes("desert") || name.includes("safari")) {
      images.push("/vast-desert-landscape.png", "/vibrant-cityscape.png", "/museum-interior.png")
    } else {
      images.push("/vast-desert-landscape.png", "/vibrant-cityscape.png", "/museum-interior.png")
    }

    // Remove duplicates and ensure we have at least one image
    const uniqueImages = [...new Set(images)]
    return uniqueImages.length > 0 ? uniqueImages : ["/vast-desert-landscape.png"]
  }

  // Function to format duration
  const formatDuration = (duration: string) => {
    if (!duration) return ""

    // Extract numbers from duration string
    const match = duration.match(/(\d+)/)
    if (match) {
      const hours = match[1]
      return `${hours} ${t.hours}`
    }
    return duration
  }

  if (!tours || tours.length === 0) {
    return (
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t.trendingAdventures}</h2>
            <p className="text-gray-600">{t.noTours}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50" id="tours">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{t.trendingAdventures}</h2>
        </div>

        {/* Tours Grid with new card design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => {
            const tourImages = getTourImages(tour)
            const formattedDuration = formatDuration(tour.duration || "")

            return (
              <Link href={`/tour/view/${tour.id}`} key={tour.id}>
                <div
                  className="relative h-96 rounded-lg overflow-hidden group cursor-pointer"
                  style={{
                    backgroundImage: `url(${tourImages[0]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all duration-300" />

                  {/* Content overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                    {/* Top section */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4 leading-tight text-shadow-sm">{tour.name}</h3>
                      {tour.ship && (
                        <div className="flex items-center gap-2.5 mt-2">
                          <Ship className="h-5 w-5 text-white/90" />
                          <span className="text-base font-semibold text-white/90 text-shadow-sm">{tour.ship}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom section */}
                    <div className="space-y-4">
                      {/* Pricing section */}
                      <div className="space-y-2">
                        {/* Adult Price */}
                        {tour.price > 0 && (
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-black text-white text-shadow-sm">€{tour.price}</div>
                            <div className="text-sm font-medium text-white/80 text-shadow-xs">{t.adult}</div>
                          </div>
                        )}

                        {/* Children Price */}
                        {tour.children_price && tour.children_price > 0 && (
                          <div className="flex items-baseline gap-2">
                            <div className="text-xl font-bold text-white/90 text-shadow-xs">€{tour.children_price}</div>
                            <div className="text-xs font-medium text-white/70 text-shadow-xs">{t.children}</div>
                          </div>
                        )}
                      </div>


                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ToursSection

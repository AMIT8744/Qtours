"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TourImageCarouselProps {
  images: string[]
  tourName: string
  autoPlay?: boolean
  interval?: number
}

export function TourImageCarousel({ images, tourName, autoPlay = true, interval = 4000 }: TourImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-play functionality with smoother timing
  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        setIsTransitioning(false)
      }, 150) // Small delay for smooth transition
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, isHovered, images.length, interval])

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
      setIsTransitioning(false)
    }, 150)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      setIsTransitioning(false)
    }, 150)
  }

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (index === currentIndex || isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No image available</span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-40 sm:h-48 overflow-hidden group rounded-t-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Smooth Transitions */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${tourName} - Image ${index + 1}`}
              fill
              className={`object-cover transition-all duration-1000 ease-out ${
                index === currentIndex && !isTransitioning ? "scale-100" : "scale-105"
              } group-hover:scale-110`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Smooth Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

      {/* Navigation Arrows with Smooth Appearance */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 disabled:opacity-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 disabled:opacity-50"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Smooth Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              disabled={isTransitioning}
              className={`transition-all duration-300 ease-out rounded-full ${
                index === currentIndex ? "w-6 h-2 bg-white shadow-lg" : "w-2 h-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Smooth Progress Bar */}
      {autoPlay && images.length > 1 && !isHovered && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-20">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all ease-linear"
            style={{
              width: `${((currentIndex + 1) / images.length) * 100}%`,
              transitionDuration: `${interval}ms`,
            }}
          />
        </div>
      )}

      {/* Enhanced Auto-play Indicator */}
      {autoPlay && images.length > 1 && !isHovered && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-2 shadow-lg backdrop-blur-sm z-20">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">AUTO</span>
        </div>
      )}

      {/* Smooth Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium z-20 transition-all duration-300">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}

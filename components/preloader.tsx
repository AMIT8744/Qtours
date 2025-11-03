"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function Preloader() {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) return null

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24 animate-pulse">
          <Image
            src="https://i.ibb.co/hR1V7jBX/image.png"
            alt="Viaggi Del Qatar Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-full origin-left animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-[#6b0f1a]"></div>
        </div>
      </div>
    </div>
  )
}

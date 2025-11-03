"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Store the scroll position for each path
const scrollPositions = new Map<string, number>()

// Save the current scroll position for the current path
export function saveScrollPosition(path: string) {
  scrollPositions.set(path, window.scrollY)
}

// Restore the scroll position for the current path
export function restoreScrollPosition(path: string) {
  const position = scrollPositions.get(path)
  if (position !== undefined) {
    window.scrollTo(0, position)
  }
}

// Hook to automatically save and restore scroll position
export function useScrollPositionRestoration() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const url = pathname + searchParams.toString()

  useEffect(() => {
    // Restore scroll position when the component mounts
    restoreScrollPosition(url)

    // Save scroll position when the component unmounts
    return () => {
      saveScrollPosition(url)
    }
  }, [url])

  // Also save scroll position before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(url)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [url])
}

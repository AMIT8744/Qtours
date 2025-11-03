"use client"

import { useScrollPositionRestoration } from "@/lib/scroll-position"

export function ScrollRestoration() {
  // This hook will handle saving and restoring scroll position
  useScrollPositionRestoration()

  // This component doesn't render anything
  return null
}

"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ClickOutsideProps {
  onClickOutside: () => void
  children: React.ReactNode
}

export default function ClickOutside({ onClickOutside, children }: ClickOutsideProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClickOutside])

  return <div ref={wrapperRef}>{children}</div>
}

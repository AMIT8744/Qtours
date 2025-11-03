import type React from "react"
import { HeaderNavigation } from "@/components/header-navigation"

export default function NewBookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavigation />
      <main className="flex-1">{children}</main>
    </div>
  )
}

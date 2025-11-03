import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/app/actions/auth-actions"
import HeaderNavigation from "@/components/header-navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNavigation user={session.user} />
      <main className="pt-16">{children}</main>
    </div>
  )
}

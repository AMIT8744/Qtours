import { getSession } from "@/app/actions/auth-actions"
import { redirect } from "next/navigation"
import { getAllPackages } from "@/app/actions/packages-actions"
import PackagesClient from "./packages-client"

export default async function PackagesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const packages = await getAllPackages()

  return <PackagesClient initialPackages={packages} />
} 
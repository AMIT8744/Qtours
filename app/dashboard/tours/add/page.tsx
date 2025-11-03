export const dynamic = "force-dynamic"

import { getLocations } from "@/app/actions/tour-actions"
import { getSession } from "@/app/actions/auth-actions"
import AddTourForm from "@/components/add-tour-form"
import { redirect } from "next/navigation"
import { getUnreadNotificationsCount } from "@/app/actions/notification-actions"

export default async function AddTourPage() {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch data needed for the form
  const locations = await getLocations()
  const unreadNotificationsCount = await getUnreadNotificationsCount(session.id)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Tour</h1>
            <p className="text-muted-foreground">Create a new tour in the system</p>
          </div>

          <AddTourForm locations={locations} />
        </div>
      </main>
    </div>
  )
}

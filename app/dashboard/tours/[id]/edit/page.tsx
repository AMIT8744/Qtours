export const dynamic = "force-dynamic"

import { getTourById } from "@/app/actions/tour-actions"
import { getSession } from "@/app/actions/auth-actions"
import { redirect, notFound } from "next/navigation"
import EditTourForm from "@/components/edit-tour-form"

interface EditTourPageProps {
  params: {
    id: string
  }
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect("/")
  }

  // Fetch the tour data
  const tour = await getTourById(params.id)
  if (!tour) {
    notFound()
  }

  // Log the tour data to verify all fields are present
  console.log("Tour data:", tour)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 pt-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Tour</h1>
            <p className="text-muted-foreground">Update the tour information</p>
          </div>

          <EditTourForm tour={tour} />
        </div>
      </main>
    </div>
  )
}

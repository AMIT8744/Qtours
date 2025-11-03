export const dynamic = "force-dynamic"

import { checkAuth } from "@/app/actions/auth-actions"
import { getUserById } from "@/app/actions/auth-actions"
import ProfileClient from "./profile-client"

export const metadata = {
  title: "Profile | Viaggi Del Qatar",
  description: "Manage your profile and account settings",
}

export default async function ProfilePage() {
  try {
    const session = await checkAuth()
    const user = session?.user

    if (!user?.id) {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <p>Error loading profile. Please try again later.</p>
        </div>
      )
    }

    // Fetch complete user data
    const userData = await getUserById(user.id)
    
    if (!userData) {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <p>User not found. Please try again later.</p>
        </div>
      )
    }

    return <ProfileClient user={userData} />
  } catch (error) {
    console.error("Error fetching session:", error)
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Error loading profile. Please try again later.</p>
      </div>
    )
  }
}

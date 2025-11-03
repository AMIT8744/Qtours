"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Bell } from "lucide-react"
import { getSystemSetting, updateBookingNotificationsEmail } from "@/app/actions/system-settings-actions"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ProfileClientProps {
  user: User
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState(user.email)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Booking notifications email state
  const [bookingNotificationsEmail, setBookingNotificationsEmail] = useState("")
  const [isUpdatingNotificationsEmail, setIsUpdatingNotificationsEmail] = useState(false)
  const [isNotificationsEmailModalOpen, setIsNotificationsEmailModalOpen] = useState(false)

  // Load booking notifications email on component mount
  useEffect(() => {
    const loadBookingNotificationsEmail = async () => {
      try {
        const email = await getSystemSetting("booking_notifications_email")
        setBookingNotificationsEmail(email)
      } catch (error) {
        console.error("Error loading booking notifications email:", error)
      }
    }
    
    loadBookingNotificationsEmail()
  }, [])

  const handleEmailUpdate = async () => {
    if (!email || email === user.email) {
      toast({
        title: "No changes",
        description: "Email address is the same as current.",
        variant: "default",
      })
      return
    }

    setIsUpdatingEmail(true)
    try {
      const response = await fetch("/api/auth/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

             if (response.ok) {
         toast({
           title: "Success",
           description: "Email updated successfully!",
           variant: "default",
         })
       } else {
         // Handle specific email exists error
         if (response.status === 409 && data.code === "EMAIL_EXISTS") {
           toast({
             title: "Email Already Exists",
             description: "This email address is already in use by another account.",
             variant: "destructive",
           })
         } else {
           toast({
             title: "Error",
             description: data.error || "Failed to update email",
             variant: "destructive",
           })
         }
       }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully!",
          variant: "default",
        })
        setIsPasswordModalOpen(false)
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleBookingNotificationsEmailUpdate = async () => {
    if (!bookingNotificationsEmail || bookingNotificationsEmail.trim().length === 0) {
      toast({
        title: "Error",
        description: "Booking notifications email cannot be empty",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingNotificationsEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingNotificationsEmail(true)
    try {
      const formData = new FormData()
      formData.append("booking_notifications_email", bookingNotificationsEmail)

      const result = await updateBookingNotificationsEmail(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Booking notifications email updated successfully!",
          variant: "default",
        })
        setIsNotificationsEmailModalOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update booking notifications email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking notifications email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingNotificationsEmail(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="Profile" />
                <AvatarFallback className="text-lg">{user?.name?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name || ""} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button 
                    onClick={handleEmailUpdate}
                    disabled={isUpdatingEmail || email === user.email}
                    className="min-w-[120px]"
                  >
                    {isUpdatingEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={user?.role || "Admin"} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Change Password</DialogTitle>
                   <DialogDescription>
                     Enter your new password below. Make sure it's at least 6 characters long.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                     <Label htmlFor="new-password">New Password</Label>
                     <div className="relative">
                       <Input
                         id="new-password"
                         type={showPassword ? "text" : "password"}
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         placeholder="Enter new password"
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? (
                           <EyeOff className="h-4 w-4" />
                         ) : (
                           <Eye className="h-4 w-4" />
                         )}
                       </Button>
                     </div>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="confirm-password">Confirm New Password</Label>
                     <div className="relative">
                       <Input
                         id="confirm-password"
                         type={showConfirmPassword ? "text" : "password"}
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         placeholder="Confirm new password"
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       >
                         {showConfirmPassword ? (
                           <EyeOff className="h-4 w-4" />
                         ) : (
                           <Eye className="h-4 w-4" />
                         )}
                       </Button>
                     </div>
                   </div>
                 </div>
                 <DialogFooter>
                   <Button
                     variant="outline"
                     onClick={() => {
                       setIsPasswordModalOpen(false)
                       setNewPassword("")
                       setConfirmPassword("")
                     }}
                   >
                     Cancel
                   </Button>
                   <Button
                     onClick={handlePasswordUpdate}
                     disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                   >
                     {isUpdatingPassword ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Updating...
                       </>
                     ) : (
                       "Update Password"
                     )}
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Booking Notifications
            </CardTitle>
            <CardDescription>Manage booking notification settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="booking-notifications-email">Booking Notifications Email</Label>
              <div className="flex space-x-2">
                <Input 
                  id="booking-notifications-email" 
                  type="email" 
                  value={bookingNotificationsEmail}
                  onChange={(e) => setBookingNotificationsEmail(e.target.value)}
                  placeholder="Enter email for booking notifications"
                />
                <Button 
                  onClick={() => setIsNotificationsEmailModalOpen(true)}
                  disabled={isUpdatingNotificationsEmail}
                  className="min-w-[120px]"
                >
                  {isUpdatingNotificationsEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                This email will receive notifications when new bookings are created.
              </p>
            </div>

            <Dialog open={isNotificationsEmailModalOpen} onOpenChange={setIsNotificationsEmailModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Booking Notifications Email</DialogTitle>
                  <DialogDescription>
                    Enter the email address that should receive notifications when new bookings are created.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="modal-booking-notifications-email">Email Address</Label>
                    <Input
                      id="modal-booking-notifications-email"
                      type="email"
                      value={bookingNotificationsEmail}
                      onChange={(e) => setBookingNotificationsEmail(e.target.value)}
                      placeholder="Enter email for booking notifications"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNotificationsEmailModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookingNotificationsEmailUpdate}
                    disabled={isUpdatingNotificationsEmail || !bookingNotificationsEmail.trim()}
                  >
                    {isUpdatingNotificationsEmail ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
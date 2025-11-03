"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Users, CheckCircle, UserPlus, Mail, Lock, User, Bell } from "lucide-react"
import { createBookingAgent, updateBookingAgent, deleteBookingAgent } from "@/app/actions/booking-agent-actions"
import { createAgentUser, updateAgentUser, deleteAgentUser } from "@/app/actions/agent-user-actions"
import { sendAgentWelcomeEmail } from "@/lib/email-utils"

interface BookingAgent {
  id: string
  name: string
}

interface AgentUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface AgentsClientProps {
  initialAgents: BookingAgent[]
  initialAgentUsers: AgentUser[]
}

export default function AgentsClient({ initialAgents, initialAgentUsers }: AgentsClientProps) {
  const [agents, setAgents] = useState<BookingAgent[]>(initialAgents)
  const [agentUsers, setAgentUsers] = useState<AgentUser[]>(initialAgentUsers)

  // Booking Agents State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<BookingAgent | null>(null)
  const [deletingAgent, setDeletingAgent] = useState<BookingAgent | null>(null)
  const [newAgentName, setNewAgentName] = useState("")
  const [editAgentName, setEditAgentName] = useState("")

  // Agent Users State
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AgentUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AgentUser | null>(null)
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [notifyByEmail, setNotifyByEmail] = useState(true)
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    password: "",
  })

  // Notification State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedUserForNotification, setSelectedUserForNotification] = useState<AgentUser | null>(null)
  const [isSendingNotification, setIsSendingNotification] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Booking Agent Functions
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgentName.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("name", newAgentName.trim())

    try {
      const result = await createBookingAgent(formData)
      if (result.success) {
        const newAgent: BookingAgent = {
          id: result.agentId,
          name: newAgentName.trim(),
        }

        setAgents((prevAgents) => [...prevAgents, newAgent].sort((a, b) => a.name.localeCompare(b.name)))
        setSuccess(result.message)
        setNewAgentName("")
        setIsAddDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to create booking agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAgent || !editAgentName.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("name", editAgentName.trim())

    try {
      const result = await updateBookingAgent(editingAgent.id, formData)
      if (result.success) {
        setAgents((prevAgents) =>
          prevAgents
            .map((agent) => (agent.id === editingAgent.id ? { ...agent, name: editAgentName.trim() } : agent))
            .sort((a, b) => a.name.localeCompare(b.name)),
        )

        setSuccess(result.message)
        setEditingAgent(null)
        setEditAgentName("")
        setIsEditDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update booking agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAgent = async () => {
    if (!deletingAgent) return

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteBookingAgent(deletingAgent.id)
      if (result.success) {
        setAgents((prevAgents) => prevAgents.filter((a) => a.id !== deletingAgent.id))
        setSuccess(result.message)
        setIsDeleteDialogOpen(false)
        setDeletingAgent(null)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to delete booking agent")
    } finally {
      setIsDeleting(false)
    }
  }

  // Agent User Functions
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("name", newUserData.name.trim())
    formData.append("email", newUserData.email.trim())
    formData.append("password", newUserData.password)
    formData.append("notifyByEmail", notifyByEmail.toString())

    try {
      const result = await createAgentUser(formData)
      if (result.success) {
        const newUser: AgentUser = {
          id: result.userId,
          name: newUserData.name.trim(),
          email: newUserData.email.trim(),
          role: "agent",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setAgentUsers((prevUsers) => [...prevUsers, newUser].sort((a, b) => a.name.localeCompare(b.name)))
        setSuccess(result.message)
        setNewUserData({ name: "", email: "", password: "" })
        setNotifyByEmail(true)
        setIsAddUserDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to create agent user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editUserData.name.trim() || !editUserData.email.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("name", editUserData.name.trim())
    formData.append("email", editUserData.email.trim())
    if (editUserData.password.trim()) {
      formData.append("password", editUserData.password)
    }

    try {
      const result = await updateAgentUser(editingUser.id, formData)
      if (result.success) {
        setAgentUsers((prevUsers) =>
          prevUsers
            .map((user) =>
              user.id === editingUser.id
                ? { ...user, name: editUserData.name.trim(), email: editUserData.email.trim() }
                : user,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        )

        setSuccess(result.message)
        setEditingUser(null)
        setEditUserData({ name: "", email: "", password: "" })
        setIsEditUserDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update agent user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteAgentUser(deletingUser.id)
      if (result.success) {
        setAgentUsers((prevUsers) => prevUsers.filter((u) => u.id !== deletingUser.id))
        setSuccess(result.message)
        setIsDeleteUserDialogOpen(false)
        setDeletingUser(null)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to delete agent user")
    } finally {
      setIsDeleting(false)
    }
  }

  // Notification Functions
  const handleOpenNotificationModal = (user: AgentUser) => {
    setSelectedUserForNotification(user)
    setIsNotificationModalOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleSendNotification = async () => {
    if (!selectedUserForNotification) return

    setIsSendingNotification(true)
    setError(null)
    setSuccess(null)

    try {
      // Generate a temporary password for the notification
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4)
      
      const emailResult = await sendAgentWelcomeEmail(selectedUserForNotification.email, {
        name: selectedUserForNotification.name,
        email: selectedUserForNotification.email,
        password: tempPassword
      })

      if (emailResult.success) {
        setSuccess(`Notification email sent successfully to ${selectedUserForNotification.email}`)
        setIsNotificationModalOpen(false)
        setSelectedUserForNotification(null)
      } else {
        setError(`Failed to send notification email: ${emailResult.error}`)
      }
    } catch (err) {
      console.error("Error sending notification email:", err)
      setError(`Failed to send notification email: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSendingNotification(false)
    }
  }

  const openEditDialog = (agent: BookingAgent) => {
    setEditingAgent(agent)
    setEditAgentName(agent.name)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (agent: BookingAgent) => {
    setDeletingAgent(agent)
    setIsDeleteDialogOpen(true)
  }

  const openEditUserDialog = (user: AgentUser) => {
    setEditingUser(user)
    setEditUserData({ name: user.name, email: user.email, password: "" })
    setIsEditUserDialogOpen(true)
  }

  const openDeleteUserDialog = (user: AgentUser) => {
    setDeletingUser(user)
    setIsDeleteUserDialogOpen(true)
  }

  // Clear error/success messages when dialogs open
  const handleOpenAddDialog = () => {
    setError(null)
    setSuccess(null)
    setIsAddDialogOpen(true)
  }

  const handleOpenEditDialog = (agent: BookingAgent) => {
    setError(null)
    setSuccess(null)
    openEditDialog(agent)
  }

  const handleOpenAddUserDialog = () => {
    setError(null)
    setSuccess(null)
    setIsAddUserDialogOpen(true)
  }

  const handleOpenEditUserDialog = (user: AgentUser) => {
    setError(null)
    setSuccess(null)
    openEditUserDialog(user)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
      {/* Header with background */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-[#6b0f1a]" />
              Booking Agents Management
            </h1>
            <p className="text-gray-500 mt-1">Manage booking agents and agent accounts</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in-50">
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Booking Agents Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6b0f1a]" />
                Booking Agents
                <span className="text-sm font-normal text-gray-500 ml-2">({agents.length})</span>
              </CardTitle>
              <CardDescription>Manage booking agents for tours</CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog} className="bg-[#6b0f1a] hover:bg-[#8a1325]" type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No booking agents found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md">
                Get started by adding a booking agent to use in your tours and bookings.
              </p>
              <Button onClick={handleOpenAddDialog} className="mt-6 bg-[#6b0f1a] hover:bg-[#8a1325]" type="button">
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-6 font-medium">Name</th>
                    <th className="text-right py-4 px-6 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{agent.name}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(agent)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(agent)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Accounts Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#6b0f1a]" />
                Agent Accounts
                <span className="text-sm font-normal text-gray-500 ml-2">({agentUsers.length})</span>
              </CardTitle>
              <CardDescription>Manage user accounts with agent role</CardDescription>
            </div>
            <Button onClick={handleOpenAddUserDialog} className="bg-[#6b0f1a] hover:bg-[#8a1325]" type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {agentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No agent accounts found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md">
                Create agent user accounts to allow agents to access the system.
              </p>
              <Button onClick={handleOpenAddUserDialog} className="mt-6 bg-[#6b0f1a] hover:bg-[#8a1325]" type="button">
                <Plus className="mr-2 h-4 w-4" />
                Add Agent Account
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-6 font-medium">Name</th>
                    <th className="text-left py-4 px-6 font-medium">Email</th>
                    <th className="text-left py-4 px-6 font-medium">Role</th>
                    <th className="text-right py-4 px-6 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agentUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{user.name}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenNotificationModal(user)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            title="Send notification email"
                          >
                            <Bell className="h-4 w-4" />
                            <span>Notify</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditUserDialog(user)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteUserDialog(user)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Booking Agent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Booking Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="Enter agent name"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setNewAgentName("")
                  setError(null)
                }}
                className="px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325] px-4">
                {isSubmitting ? "Adding..." : "Add Agent"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-agent-name">Agent Name</Label>
              <Input
                id="edit-agent-name"
                value={editAgentName}
                onChange={(e) => setEditAgentName(e.target.value)}
                placeholder="Enter agent name"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingAgent(null)
                  setEditAgentName("")
                  setError(null)
                }}
                className="px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325] px-4">
                {isSubmitting ? "Updating..." : "Update Agent"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Agent User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Agent Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="user-name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="user-email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="user-password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notify-email"
                checked={notifyByEmail}
                onChange={(e) => setNotifyByEmail(e.target.checked)}
                className="h-4 w-4 text-[#6b0f1a] focus:ring-[#6b0f1a] border-gray-300 rounded"
              />
              <Label htmlFor="notify-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Notify user by email
              </Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddUserDialogOpen(false)
                  setNewUserData({ name: "", email: "", password: "" })
                  setNotifyByEmail(true)
                  setError(null)
                }}
                className="px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325] px-4">
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agent Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-user-name"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-user-password"
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Leave password blank to keep the current password</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditUserDialogOpen(false)
                  setEditingUser(null)
                  setEditUserData({ name: "", email: "", password: "" })
                  setError(null)
                }}
                className="px-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325] px-4">
                {isSubmitting ? "Updating..." : "Update Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Agent Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete agent <strong>{deletingAgent?.name}</strong> from the system. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingAgent(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Agent User Confirmation Dialog */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this agent account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent account for <strong>{deletingUser?.name}</strong> (
              {deletingUser?.email}) from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteUserDialogOpen(false)
                setDeletingUser(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Confirmation Dialog */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Send Notification Email
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to send a notification email to this agent? The email will contain their account credentials and a welcome message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Agent Details:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Name:</strong> {selectedUserForNotification?.name}</p>
                <p><strong>Email:</strong> {selectedUserForNotification?.email}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> A new temporary password will be generated and sent to the agent's email address.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNotificationModalOpen(false)
                setSelectedUserForNotification(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={isSendingNotification}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSendingNotification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

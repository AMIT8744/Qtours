"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type Ship, createShip, deleteShip, updateShip } from "@/app/actions/ship-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, ShipIcon, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

interface ShipsClientProps {
  initialShips: Ship[]
}

export default function ShipsClient({ initialShips }: ShipsClientProps) {
  const [ships, setShips] = useState<Ship[]>(initialShips)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newShipName, setNewShipName] = useState("")
  const [editingShip, setEditingShip] = useState<Ship | null>(null)
  const [deletingShip, setDeletingShip] = useState<Ship | null>(null)
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

  // Handle adding a new ship
  const handleAddShip = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createShip(newShipName)
      if (result.success && result.ship) {
        // Update local state immediately
        const updatedShips = [...ships, result.ship].sort((a, b) => a.name.localeCompare(b.name))
        setShips(updatedShips)

        setSuccess(result.message)
        setNewShipName("")
        setIsAddDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle editing a ship
  const handleEditShip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingShip) return

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await updateShip(editingShip.id, editingShip.name)
      if (result.success && result.ship) {
        // Update local state immediately
        const updatedShips = ships
          .map((ship) => (ship.id === result.ship.id ? result.ship : ship))
          .sort((a, b) => a.name.localeCompare(b.name))
        setShips(updatedShips)

        setSuccess(result.message)
        setIsEditDialogOpen(false)
        setEditingShip(null)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting a ship
  const handleDeleteShip = async () => {
    if (!deletingShip) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteShip(deletingShip.id)
      if (result.success) {
        // Update local state immediately
        const updatedShips = ships.filter((ship) => ship.id !== deletingShip.id)
        setShips(updatedShips)

        setSuccess(result.message)
        setIsDeleteDialogOpen(false)
        setDeletingShip(null)
      } else {
        setError(result.message)
        setIsDeleteDialogOpen(false)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
      {/* Header with background */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShipIcon className="h-8 w-8 text-[#6b0f1a]" />
              Ships Management
            </h1>
            <p className="text-gray-500 mt-1">Manage ships for tours and bookings</p>
          </div>
          <Button
            onClick={() => {
              setNewShipName("")
              setError(null)
              setIsAddDialogOpen(true)
            }}
            className="bg-[#6b0f1a] hover:bg-[#8a1325]"
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Ship
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in-50">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <ShipIcon className="h-5 w-5 text-[#6b0f1a]" />
            Ships
            <span className="text-sm font-normal text-gray-500 ml-2">({ships.length})</span>
          </CardTitle>
          <CardDescription>Manage ships for tours and bookings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {ships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <ShipIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No ships found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md">
                Get started by adding a ship to use in your tours and bookings.
              </p>
              <Button
                onClick={() => {
                  setNewShipName("")
                  setError(null)
                  setIsAddDialogOpen(true)
                }}
                className="mt-6 bg-[#6b0f1a] hover:bg-[#8a1325]"
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ship
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
                  {ships.map((ship) => (
                    <tr key={ship.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{ship.name}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingShip(ship)
                              setError(null)
                              setIsEditDialogOpen(true)
                            }}
                            className="flex items-center gap-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeletingShip(ship)
                              setError(null)
                              setIsDeleteDialogOpen(true)
                            }}
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

      {/* Add Ship Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ship</DialogTitle>
            <DialogDescription>Enter the name of the ship to add it to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddShip}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ship-name">Ship Name</Label>
                <Input
                  id="ship-name"
                  placeholder="Enter ship name"
                  value={newShipName}
                  onChange={(e) => setNewShipName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                {isSubmitting ? "Adding..." : "Add Ship"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ship Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ship</DialogTitle>
            <DialogDescription>Update the ship name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditShip}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ship-name">Ship Name</Label>
                <Input
                  id="edit-ship-name"
                  placeholder="Enter ship name"
                  value={editingShip?.name || ""}
                  onChange={(e) => setEditingShip(editingShip ? { ...editingShip, name: e.target.value } : null)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Ship Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this ship?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the ship &quot;{deletingShip?.name}&quot; from the system. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteShip()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Ship"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

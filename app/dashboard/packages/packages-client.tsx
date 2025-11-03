"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Package, CheckCircle, Star } from "lucide-react"
import { createPackage, updatePackage, deletePackage, type Package } from "@/app/actions/packages-actions"

interface PackagesClientProps {
  initialPackages: Package[]
}

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cruise_line: "COSTA",
    excursions_count: 3,
    adult_price: "",
    child_price: "",
    is_popular: false,
    color_scheme: "blue",
    sort_order: 0,
    is_active: true,
  })

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cruise_line: "COSTA",
      excursions_count: 3,
      adult_price: "",
      child_price: "",
      is_popular: false,
      color_scheme: "blue",
      sort_order: 0,
      is_active: true,
    })
  }

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.description || !formData.adult_price || !formData.child_price) {
      setError("All fields are required")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("cruise_line", formData.cruise_line)
    data.append("excursions_count", formData.excursions_count.toString())
    data.append("adult_price", formData.adult_price)
    data.append("child_price", formData.child_price)
    data.append("is_popular", formData.is_popular.toString())
    data.append("color_scheme", formData.color_scheme)
    data.append("sort_order", formData.sort_order.toString())
    data.append("is_active", formData.is_active.toString())

    try {
      const result = await createPackage(data)
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to create package")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage || !formData.name || !formData.description || !formData.adult_price || !formData.child_price) {
      setError("All fields are required")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("cruise_line", formData.cruise_line)
    data.append("excursions_count", formData.excursions_count.toString())
    data.append("adult_price", formData.adult_price)
    data.append("child_price", formData.child_price)
    data.append("is_popular", formData.is_popular.toString())
    data.append("color_scheme", formData.color_scheme)
    data.append("sort_order", formData.sort_order.toString())
    data.append("is_active", formData.is_active.toString())

    try {
      const result = await updatePackage(editingPackage.id, data)
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update package")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!deletingPackage) return

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deletePackage(deletingPackage.id)
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to delete package")
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (pkg: Package) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      cruise_line: pkg.cruise_line,
      excursions_count: pkg.excursions_count,
      adult_price: pkg.adult_price.toString(),
      child_price: pkg.child_price.toString(),
      is_popular: pkg.is_popular,
      color_scheme: pkg.color_scheme,
      sort_order: pkg.sort_order,
      is_active: pkg.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (pkg: Package) => {
    setDeletingPackage(pkg)
    setIsDeleteDialogOpen(true)
  }

  const handleOpenAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleOpenEditDialog = (pkg: Package) => {
    setError(null)
    setSuccess(null)
    openEditDialog(pkg)
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-[#6b0f1a]" />
              Tour Packages Management
            </h1>
            <p className="text-gray-500 mt-1">Manage tour packages for COSTA and MSC cruises</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/init-packages', { method: 'POST' })
                  const result = await response.json()
                  if (result.success) {
                    window.location.reload()
                  } else {
                    setError(result.message)
                  }
                } catch (err) {
                  setError('Failed to initialize packages')
                }
              }}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Initialize Packages
            </Button>
            <Button onClick={handleOpenAddDialog} className="bg-[#6b0f1a] hover:bg-[#8a1325]" type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
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

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    pkg.color_scheme === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{pkg.cruise_line}</CardTitle>
                    <CardDescription className="text-xs">{pkg.excursions_count} Excursions</CardDescription>
                  </div>
                </div>
                {pkg.is_popular && (
                  <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    Popular
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{pkg.name}</h3>
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">{pkg.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Star className="h-3 w-3" />
                  <span>Italian Guide</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>📍</span>
                  <span>Guaranteed Return</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>👥</span>
                  <span>Small Groups</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900">€{pkg.adult_price}</span>
                  <span className="text-xs text-gray-500">Adult</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-900">€{pkg.child_price}</span>
                  <span className="text-xs text-gray-500">Child</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(pkg)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(pkg)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Package Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Package</DialogTitle>
            <DialogDescription>Create a new tour package for your customers.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPackage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pacchetto 3 Escursioni - COSTA"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Doha e Muscat + 1 escursione a scelta"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cruise_line">Cruise Line</Label>
                <Select value={formData.cruise_line} onValueChange={(value) => setFormData({ ...formData, cruise_line: value, color_scheme: value === 'COSTA' ? 'blue' : 'purple' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COSTA">COSTA</SelectItem>
                    <SelectItem value="MSC">MSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excursions_count">Excursions Count</Label>
                <Select value={formData.excursions_count.toString()} onValueChange={(value) => setFormData({ ...formData, excursions_count: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adult_price">Adult Price (€)</Label>
                <Input
                  id="adult_price"
                  type="number"
                  step="0.01"
                  value={formData.adult_price}
                  onChange={(e) => setFormData({ ...formData, adult_price: e.target.value })}
                  placeholder="150.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="child_price">Child Price (€)</Label>
                <Input
                  id="child_price"
                  type="number"
                  step="0.01"
                  value={formData.child_price}
                  onChange={(e) => setFormData({ ...formData, child_price: e.target.value })}
                  placeholder="90.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color_scheme">Color Scheme</Label>
                <Select value={formData.color_scheme} onValueChange={(value) => setFormData({ ...formData, color_scheme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue (COSTA)</SelectItem>
                    <SelectItem value="purple">Purple (MSC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked as boolean })}
              />
              <Label htmlFor="is_popular">Mark as Popular</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                {isSubmitting ? "Creating..." : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>Update the package details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPackage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pacchetto 3 Escursioni - COSTA"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Doha e Muscat + 1 escursione a scelta"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cruise_line">Cruise Line</Label>
                <Select value={formData.cruise_line} onValueChange={(value) => setFormData({ ...formData, cruise_line: value, color_scheme: value === 'COSTA' ? 'blue' : 'purple' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COSTA">COSTA</SelectItem>
                    <SelectItem value="MSC">MSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-excursions_count">Excursions Count</Label>
                <Select value={formData.excursions_count.toString()} onValueChange={(value) => setFormData({ ...formData, excursions_count: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-adult_price">Adult Price (€)</Label>
                <Input
                  id="edit-adult_price"
                  type="number"
                  step="0.01"
                  value={formData.adult_price}
                  onChange={(e) => setFormData({ ...formData, adult_price: e.target.value })}
                  placeholder="150.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-child_price">Child Price (€)</Label>
                <Input
                  id="edit-child_price"
                  type="number"
                  step="0.01"
                  value={formData.child_price}
                  onChange={(e) => setFormData({ ...formData, child_price: e.target.value })}
                  placeholder="90.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sort_order">Sort Order</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color_scheme">Color Scheme</Label>
                <Select value={formData.color_scheme} onValueChange={(value) => setFormData({ ...formData, color_scheme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue (COSTA)</SelectItem>
                    <SelectItem value="purple">Purple (MSC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked as boolean })}
              />
              <Label htmlFor="edit-is_popular">Mark as Popular</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingPackage(null)
                  resetForm()
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                {isSubmitting ? "Updating..." : "Update Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this package?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the package <strong>{deletingPackage?.name}</strong> from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingPackage(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePackage}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Package"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateTour } from "@/app/actions/tour-actions"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import ImageUpload from "@/components/image-upload"
import TourDatePicker from "@/components/tour-date-picker"

interface Tour {
  id: string
  name: string
  location_name: string
  duration: string
  price: number
  children_price?: number
  capacity: number
  status: string
  description?: string
  description_it?: string
  images: string[]
  available_dates?: string[]
  ship?: string
}

interface EditTourFormProps {
  tour: Tour
}

export default function EditTourForm({ tour }: EditTourFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize form data from tour props
  const [formData, setFormData] = useState({
    name: tour.name || "",
    location_name: tour.location_name || "",
    duration: tour.duration || "",
    price: tour.price ? tour.price.toString() : "",
    children_price: tour.children_price ? tour.children_price.toString() : "0",
    capacity: tour.capacity ? tour.capacity.toString() : "",
    status: tour.status || "",
    description: tour.description || "",
    description_it: tour.description_it || "",
    images: tour.images || [],
    ship: tour.ship || "",
  })

  // Initialize available dates
  const [availableDates, setAvailableDates] = useState<string[]>(() => {
    if (tour.available_dates && Array.isArray(tour.available_dates)) {
      return tour.available_dates.filter((date) => date && typeof date === "string")
    }
    return []
  })

  // Debug log to verify data
  useEffect(() => {
    console.log("Tour data in form:", tour)
    console.log("Form data initialized:", formData)
    console.log("Available dates initialized:", availableDates)
  }, [tour, formData, availableDates])

  // Handle redirect after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/dashboard/tours")
      }, 1000) // 1 second delay to show success message

      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleImagesChange = (newImages: string[]) => {
    setFormData((prev) => ({ ...prev, images: newImages }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields - only name is required now
      if (!formData.name) {
        setError("Tour name is required")
        setIsSubmitting(false)
        return
      }

      const result = await updateTour(tour.id, {
        name: formData.name,
        duration: formData.duration,
        price: formData.price ? Number.parseFloat(formData.price) : 0,
        children_price: formData.children_price ? Number.parseFloat(formData.children_price) : 0,
        location_name: formData.location_name,
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : 0,
        status: formData.status,
        description: formData.description,
        description_it: formData.description_it,
        images: formData.images,
        available_dates: availableDates,
        ship: formData.ship,
      })

      if (result.success) {
        setSuccess(true)
        // The redirect will happen in the useEffect above
      } else {
        setError(result.message || "Failed to update tour")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message - Clean and elegant like booking agents */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Tour updated successfully</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Tour: {tour.name}</CardTitle>
          <CardDescription>Update the tour information below</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tour Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter tour name"
                  required
                  disabled={success}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_name">Location</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => handleInputChange("location_name", e.target.value)}
                    placeholder="Enter location"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ship">Ship</Label>
                  <Input
                    id="ship"
                    value={formData.ship}
                    onChange={(e) => handleInputChange("ship", e.target.value)}
                    placeholder="Enter ship name"
                    disabled={success}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g. 3 hours"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Adult Price (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children_price">Children Price (€)</Label>
                  <Input
                    id="children_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.children_price}
                    onChange={(e) => handleInputChange("children_price", e.target.value)}
                    placeholder="0.00"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    placeholder="0"
                    disabled={success}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={success}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Available Dates Section */}
              <div className="space-y-2">
                <Label>Available Dates</Label>
                <TourDatePicker selectedDates={availableDates} onDatesChange={setAvailableDates} />
              </div>

              {/* Description Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <span className="fi fi-gb w-4 h-4 rounded-sm"></span>
                    Description (English)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter detailed description in English..."
                    rows={4}
                    className="resize-none"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_it" className="flex items-center gap-2">
                    <span className="fi fi-it w-4 h-4 rounded-sm"></span>
                    Descrizione (Italiano)
                  </Label>
                  <Textarea
                    id="description_it"
                    value={formData.description_it}
                    onChange={(e) => handleInputChange("description_it", e.target.value)}
                    placeholder="Inserisci la descrizione dettagliata in italiano..."
                    rows={4}
                    className="resize-none"
                    disabled={success}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tour Images</Label>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  maxSizeKB={500}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || success} className="bg-[#6b0f1a] hover:bg-[#8a1325]">
                {isSubmitting ? "Updating..." : success ? "Updated!" : "Update Tour"}
              </Button>
              <Link href="/dashboard/tours">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { createTour } from "@/app/actions/tour-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "@/components/image-upload"
import TourDatePicker from "@/components/tour-date-picker"

interface Location {
  id: string
  name: string
}

interface AddTourFormProps {
  locations: Location[]
}

export default function AddTourForm({ locations }: AddTourFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!formData.get("name")) {
        setError("Tour name is required.")
        return
      }

      images.forEach((image) => {
        formData.append("images", image)
      })

      // Add available dates to form data
      formData.append("available_dates", JSON.stringify(availableDates))

      const result = await createTour(formData)

      if (result.success) {
        setSuccess(result.message)
        // Redirect to tours page after a short delay
        setTimeout(() => {
          router.push("/dashboard/tours")
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Tour Details</CardTitle>
            <CardDescription>Enter the details for the new tour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tour Name</Label>
              <Input id="name" name="name" placeholder="Enter tour name" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_name">Location</Label>
                <Input id="location_name" name="location_name" placeholder="Enter location" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ship">Ship</Label>
                <Input id="ship" name="ship" placeholder="Enter ship name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g. 3 hours" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Adult Price (€)</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children_price">Children Price (€)</Label>
                <Input
                  id="children_price"
                  name="children_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" min="1" placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="">
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
                  name="description"
                  placeholder="Enter detailed description in English..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_it" className="flex items-center gap-2">
                  <span className="fi fi-it w-4 h-4 rounded-sm"></span>
                  Descrizione (Italiano)
                </Label>
                <Textarea
                  id="description_it"
                  name="description_it"
                  placeholder="Inserisci la descrizione dettagliata in italiano..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tour Images</Label>
              <ImageUpload images={images} onImagesChange={setImages} maxImages={5} maxSizeKB={500} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/tours">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-[#6b0f1a] hover:bg-[#8a1325]" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Tour"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

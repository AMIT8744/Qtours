"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { createTour } from "@/app/actions/tour-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2 } from "lucide-react"

interface Ship {
  id: string
  name: string
}

interface Location {
  id: string
  name: string
}

interface AddTourModalProps {
  ships: Ship[]
  locations: Location[]
  onTourAdded: (tour: any) => void
}

export default function AddTourModal({ ships, locations, onTourAdded }: AddTourModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate required fields
      const name = formData.get("name") as string
      const price = formData.get("price") as string
      const locationName = formData.get("location_name") as string

      if (!name) {
        setError("Tour name is required.")
        return
      }

      const result = await createTour(formData)

      if (result.success) {
        setSuccess(result.message)

        // Auto-close modal and pass the new tour data after a short delay
        setTimeout(() => {
          onTourAdded(result.tour)
        }, 1500)
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
          <CheckCircle className="h-4 w-4 text-green-600" />
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

            <div className="space-y-2">
              <Label htmlFor="location_name">Location</Label>
              <Input id="location_name" name="location_name" placeholder="Enter location" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g. 3 hours" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (€)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Leave blank if not yet determined"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" min="1" placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Enter tour description" rows={4} />
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 mt-4 px-6 pb-6">
            <Button type="button" variant="outline" onClick={() => onTourAdded(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#6b0f1a] hover:bg-[#8a1325]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tour"
              )}
            </Button>
          </div>
        </Card>
      </form>
    </>
  )
}

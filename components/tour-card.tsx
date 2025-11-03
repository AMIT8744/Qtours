"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Clock, Euro, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { deleteTour } from "@/app/actions/tour-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TourCardProps {
  id: string
  name: string
  duration: string
  price: number
  location: string
  capacity: number
  bookingCount: number
  status: string
}

export default function TourCard({
  id,
  name,
  duration,
  price,
  location,
  capacity,
  bookingCount,
  status,
}: TourCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteTour(id)
      if (result.success) {
        // Force a page refresh to update the tour list
        window.location.reload()
      } else {
        setError(result.message || "Failed to delete tour")
      }
    } catch (err) {
      setError("An error occurred while deleting the tour.")
      console.error("Delete error:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription className="mt-1">{location}</CardDescription>
          </div>
          <Badge
            variant={status === "active" ? "default" : status === "upcoming" ? "outline" : "secondary"}
            className={
              status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : status === "upcoming"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              Capacity: {capacity} ({bookingCount} booked)
            </span>
          </div>
          <div className="flex items-center text-sm font-semibold">
            <Euro className="mr-2 h-4 w-4" />
            <span>€{Number(price).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Link href={`/dashboard/tours/${id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the tour and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

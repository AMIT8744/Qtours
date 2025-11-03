"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { deleteBookingAction } from "@/app/actions/dashboard-actions"

interface DeleteBookingDialogProps {
  bookingId: string
  bookingReference: string
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectPath?: string
  onDelete?: (id: string) => Promise<void>
}

export default function DeleteBookingDialog({
  bookingId,
  bookingReference,
  open,
  onOpenChange,
  redirectPath,
  onDelete,
}: DeleteBookingDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // If we have an onDelete handler (for optimistic updates), use that
      if (onDelete) {
        await onDelete(bookingId)
      } else {
        // Otherwise use the server action directly
        await deleteBookingAction(bookingId)

        // Only redirect if a path is specified
        if (redirectPath) {
          router.push(redirectPath)
        } else {
          // Just refresh the current page
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete booking <strong>{bookingReference}</strong> and all associated tour data. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Booking"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

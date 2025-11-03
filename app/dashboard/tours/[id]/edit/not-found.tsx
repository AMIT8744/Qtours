import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TourNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Tour Not Found</h1>
        <p className="text-muted-foreground">The tour you're looking for doesn't exist or has been deleted.</p>
        <Link href="/dashboard/tours">
          <Button>Back to Tours</Button>
        </Link>
      </div>
    </div>
  )
}

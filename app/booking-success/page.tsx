import { Suspense } from "react"
import BookingSuccessClient from "./booking-success-client"

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingSuccessClient />
    </Suspense>
  )
}

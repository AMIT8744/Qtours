import { getTourById } from "@/app/actions/tour-actions"
import { notFound } from "next/navigation"
import TourViewClient from "./tour-view-client"

interface TourViewPageProps {
  params: {
    id: string
  }
}

export default async function TourViewPage({ params }: TourViewPageProps) {
  const tour = await getTourById(params.id)

  if (!tour) {
    notFound()
  }

  return <TourViewClient tour={tour} />
}

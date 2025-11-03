import { getShips } from "@/app/actions/ship-actions"
import ShipsClient from "./ships-client"

export const metadata = {
  title: "Ships Management | Viaggi Del Qatar",
  description: "Manage ships for tours and bookings",
}

export default async function ShipsPage() {
  const ships = await getShips()

  return <ShipsClient initialShips={ships} />
}

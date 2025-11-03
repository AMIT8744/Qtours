export interface Tour {
  id: number
  name: string
  location: string
  duration: string
  price: number
  capacity: number
  description: string
  image: string
  available_dates: string[]
}

const sampleTours: Tour[] = [
  {
    id: 1,
    name: "Dubai City Tour",
    location: "Dubai",
    duration: "8 ore",
    price: 85,
    capacity: 20,
    description: "Esplora le meraviglie di Dubai con la nostra guida italiana esperta",
    image: "/placeholder.svg?height=300&width=400",
    available_dates: ["2024-01-15", "2024-01-20", "2024-01-25"],
  },
  {
    id: 2,
    name: "Abu Dhabi Grand Tour",
    location: "Abu Dhabi",
    duration: "10 ore",
    price: 95,
    capacity: 18,
    description: "Scopri la capitale degli Emirati con un tour completo in italiano",
    image: "/placeholder.svg?height=300&width=400",
    available_dates: ["2024-01-16", "2024-01-21", "2024-01-26"],
  },
  {
    id: 3,
    name: "Doha Highlights",
    location: "Doha",
    duration: "6 ore",
    price: 75,
    capacity: 22,
    description: "Visita i luoghi più iconici di Doha con guide italiane qualificate",
    image: "/placeholder.svg?height=300&width=400",
    available_dates: ["2024-01-17", "2024-01-22", "2024-01-27"],
  },
]

export function getAllTours(): Tour[] {
  return sampleTours
}

export function getTourById(id: number): Tour | undefined {
  return sampleTours.find((tour) => tour.id === id)
}

export function getToursByLocation(location: string): Tour[] {
  return sampleTours.filter((tour) => tour.location.toLowerCase().includes(location.toLowerCase()))
}

export default {
  getAllTours,
  getTourById,
  getToursByLocation,
}

/**
 * Tour schedule management for MSC and COSTA cruise lines
 */

export interface TourSchedule {
  tourId: string
  tourName: string
  mscSchedule?: {
    dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  }
  costaSchedule?: {
    dayOfWeek: number
    startDate: string
    endDate: string
  }
}

// Update all tour schedules with current/future date ranges
export const TOUR_SCHEDULES: TourSchedule[] = [
  {
    tourId: "1",
    tourName: "ABU DHABI XL",
    mscSchedule: {
      dayOfWeek: 3, // Wednesday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
    costaSchedule: {
      dayOfWeek: 5, // Friday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "2",
    tourName: "DUBAI XL",
    mscSchedule: {
      dayOfWeek: 5, // Friday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
    costaSchedule: {
      dayOfWeek: 0, // Sunday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "3",
    tourName: "DUBAI BY NIGHT",
    costaSchedule: {
      dayOfWeek: 6, // Saturday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "4",
    tourName: "DUBAI MEZZA GIORNATA",
    mscSchedule: {
      dayOfWeek: 6, // Saturday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "5",
    tourName: "DOHA AEROPORTO",
    mscSchedule: {
      dayOfWeek: 0, // Sunday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "6",
    tourName: "DOHA XL",
    mscSchedule: {
      dayOfWeek: 0, // Sunday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
    costaSchedule: {
      dayOfWeek: 4, // Thursday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "7",
    tourName: "MANAMA CITY",
    mscSchedule: {
      dayOfWeek: 1, // Monday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "8",
    tourName: "MANAMA & CIRCUITO F1",
    mscSchedule: {
      dayOfWeek: 1, // Monday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "9",
    tourName: "MUSCAT CITY",
    costaSchedule: {
      dayOfWeek: 2, // Tuesday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "10",
    tourName: "DOHA DESERT SAFARI & SOUK WAKIF",
    mscSchedule: {
      dayOfWeek: 0, // Sunday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
    costaSchedule: {
      dayOfWeek: 4, // Thursday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
  {
    tourId: "11",
    tourName: "DUBAI DESERTO+CENA SPETTACOLO",
    mscSchedule: {
      dayOfWeek: 5, // Friday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
    costaSchedule: {
      dayOfWeek: 6, // Saturday
      startDate: "2024-12-01",
      endDate: "2025-06-30",
    },
  },
]

/**
 * Get available dates for a specific tour
 */
export function getAvailableDatesForTour(tourId: string): Date[] {
  const schedule = TOUR_SCHEDULES.find((s) => s.tourId === tourId)
  if (!schedule) {
    console.log(`No schedule found for tour ID: ${tourId}`)
    return []
  }

  const availableDates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate MSC dates
  if (schedule.mscSchedule) {
    const startDate = new Date(schedule.mscSchedule.startDate)
    const endDate = new Date(schedule.mscSchedule.endDate)
    const dayOfWeek = schedule.mscSchedule.dayOfWeek

    // Start from today or schedule start date, whichever is later
    const currentDate = new Date(Math.max(today.getTime(), startDate.getTime()))

    // Find the first occurrence of the target day of week
    while (currentDate.getDay() !== dayOfWeek && currentDate <= endDate) {
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate all dates for this day of week within the range
    while (currentDate <= endDate) {
      availableDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 7) // Next week
    }
  }

  // Generate COSTA dates
  if (schedule.costaSchedule) {
    const startDate = new Date(schedule.costaSchedule.startDate)
    const endDate = new Date(schedule.costaSchedule.endDate)
    const dayOfWeek = schedule.costaSchedule.dayOfWeek

    // Start from today or schedule start date, whichever is later
    const currentDate = new Date(Math.max(today.getTime(), startDate.getTime()))

    // Find the first occurrence of the target day of week
    while (currentDate.getDay() !== dayOfWeek && currentDate <= endDate) {
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate all dates for this day of week within the range
    while (currentDate <= endDate) {
      availableDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 7) // Next week
    }
  }

  // Sort dates and remove duplicates
  const uniqueDates = availableDates
    .sort((a, b) => a.getTime() - b.getTime())
    .filter((date, index, array) => index === 0 || date.getTime() !== array[index - 1].getTime())

  console.log(`Found ${uniqueDates.length} available dates for tour ${tourId}`)
  return uniqueDates
}

/**
 * Check if a specific date is available for a tour
 */
export function isDateAvailableForTour(tourId: string, date: Date): boolean {
  const availableDates = getAvailableDatesForTour(tourId)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  return availableDates.some((availableDate) => {
    availableDate.setHours(0, 0, 0, 0)
    return availableDate.getTime() === targetDate.getTime()
  })
}

/**
 * Get the cruise line for a specific date and tour
 */
export function getCruiseLineForDate(tourId: string, date: Date): "MSC" | "COSTA" | null {
  const schedule = TOUR_SCHEDULES.find((s) => s.tourId === tourId)
  if (!schedule) return null

  const dayOfWeek = date.getDay()
  const dateStr = date.toISOString().split("T")[0]

  // Check MSC schedule
  if (
    schedule.mscSchedule &&
    schedule.mscSchedule.dayOfWeek === dayOfWeek &&
    dateStr >= schedule.mscSchedule.startDate &&
    dateStr <= schedule.mscSchedule.endDate
  ) {
    return "MSC"
  }

  // Check COSTA schedule
  if (
    schedule.costaSchedule &&
    schedule.costaSchedule.dayOfWeek === dayOfWeek &&
    dateStr >= schedule.costaSchedule.startDate &&
    dateStr <= schedule.costaSchedule.endDate
  ) {
    return "COSTA"
  }

  return null
}

/**
 * Get next available dates for a tour (useful for suggestions)
 */
export function getNextAvailableDates(tourId: string, count = 5): Date[] {
  const availableDates = getAvailableDatesForTour(tourId)
  return availableDates.slice(0, count)
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, MapPin, Clock, Users, Euro, Minus, Plus, ArrowLeft, Ship, PlusCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { getAvailableDatesForTour, getCruiseLineForDate } from "@/lib/tour-schedules"
import { formatDateToYYYYMMDD } from "@/lib/date-utils"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface Supplement {
  name: string
  price: number
  childrenPrice?: number
  description?: string
}

interface Tour {
  id: string
  name: string
  description?: string
  description_it?: string
  price: number
  children_price?: number
  location_name?: string
  duration?: string
  capacity?: number
  images?: string[]
  status: string
  available_dates?: string[]
}

interface TourViewClientProps {
  tour: Tour
}

export default function TourViewClient({ tour }: TourViewClientProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [language, setLanguage] = useState<"en" | "it" | "ar">("en")
  const [selectedSupplements, setSelectedSupplements] = useState<Supplement[]>([])

  // Hardcoded supplements based on tour ID
  const getSupplementsForTour = (tourId: string): Supplement[] => {
    // Convert to string and trim to ensure proper comparison
    const id = String(tourId).trim()

    switch (id) {
      case "6":
        return [
          {
            name: "Doha Museum Extra",
            price: 20,
            childrenPrice: 0,
            description: "Extended museum tour with private guide",
          },
        ]
      case "10":
        return [
          {
            name: "Giro in Cammello",
            price: 8,
            childrenPrice: 8,
            description: "Camel ride experience",
          },
        ]
      case "8":
        return [
          {
            name: "Gold Tour VIP",
            price: 25,
            childrenPrice: 25,
            description: "VIP gold tour experience",
          },
        ]
      default:
        return []
    }
  }

  const supplements = getSupplementsForTour(tour.id)

  const totalPax = adults + children
  const basePrice = tour.price * adults + (tour.children_price || 0) * children

  // Calculate supplements price
  const supplementsPrice = selectedSupplements.reduce((total, supplement) => {
    const adultSupplementPrice = supplement.price * adults
    const childrenSupplementPrice = (supplement.childrenPrice || supplement.price) * children
    return total + adultSupplementPrice + childrenSupplementPrice
  }, 0)

  const totalPrice = basePrice + supplementsPrice

  // Load saved language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("viaggi-del-qatar-language") as "en" | "it" | "ar" | null
    if (savedLanguage && ["en", "it", "ar"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Get available dates from database first, then fallback to schedule, then test dates
  const getDatabaseDates = () => {
    if (tour.available_dates && Array.isArray(tour.available_dates) && tour.available_dates.length > 0) {
      return tour.available_dates.map((dateStr) => new Date(dateStr)).filter((date) => !isNaN(date.getTime()))
    }
    return []
  }

  // Test dates for August 2025 (fallback only)
  const testDates = [
    new Date(2025, 7, 10), // 10 August 2025 (month is 0-indexed)
    new Date(2025, 7, 15), // 15 August 2025
    new Date(2025, 7, 25), // 25 August 2025
  ]

  // Priority: Database dates > Schedule dates > Test dates
  const databaseDates = getDatabaseDates()
  const availableDatesFromSchedule = getAvailableDatesForTour(tour.id)

  let availableDates: Date[]
  let hasScheduledDates = false

  if (databaseDates.length > 0) {
    availableDates = databaseDates
    hasScheduledDates = true
  } else if (availableDatesFromSchedule.length > 0) {
    availableDates = availableDatesFromSchedule
    hasScheduledDates = true
  } else {
    availableDates = testDates
    hasScheduledDates = false
  }

  // Show all available dates instead of limiting to 6
  const nextAvailableDates = availableDates // Show all dates

  // Translations
  const translations = {
    en: {
      backToTours: "Back to Tours",
      available: "Available",
      unavailable: "Unavailable",
      aboutThisTour: "About This Tour",
      cruiseSchedule: "Cruise Schedule",
      availableDepartureDates: "Available Departure Dates",
      selectFromDates: "Select from",
      availableDates: "available dates",
      whenCruisesDock: "when cruises dock at this destination.",
      quickSelect: "Quick Select:",
      mscCruises: "MSC Cruises",
      costaCruises: "COSTA Cruises",
      clickCalendar: "Click calendar for more dates",
      noUpcomingDates: "No upcoming cruise dates available",
      notScheduled: "This tour is currently not scheduled. Please check back later.",
      gallery: "Gallery",
      bookThisTour: "Book This Tour",
      perPerson: "per person",
      tourDate: "Tour Date",
      pickDate: "Pick a date",
      cruiseLine: "Cruise Line",
      passengers: "Passengers",
      adults: "Adults",
      children: "Children",
      adultsAge: "Age 13+",
      childrenAge: "Age 2-12",
      total: "Total",
      bookNow: "Book Now",
      currentlyUnavailable: "Currently Unavailable",
      selectDateToBook: "Select Date to Book",
      maximumPassengers: "Maximum",
      passengersPerBooking: "passengers per booking",
      noUpcomingDatesShort: "No upcoming dates",
      notScheduledShort: "This tour is currently not scheduled. Please check back later.",
      availableTourDates: "Available Tour Dates",
      mscCruiseDays: "MSC Cruise Days",
      costaCruiseDays: "COSTA Cruise Days",
      nextAvailableDates: "Next available dates:",
      maxPeople: "Max",
      people: "people",
      hours: "hours",
      supplements: "Optional Supplements",
      supplementsPrice: "Supplements",
      free: "Free",
      enhanceExperience: "Enhance Your Experience",
      addSupplement: "Add Supplement",
      proceedWithout: "Proceed Without",
      supplementAvailable: "Supplement Available",
      fullExperience: "For the full experience, consider adding the supplement:",
    },
    it: {
      backToTours: "Torna ai Tour",
      available: "Disponibile",
      unavailable: "Non Disponibile",
      aboutThisTour: "Informazioni su Questo Tour",
      cruiseSchedule: "Programma Crociere",
      availableDepartureDates: "Date di Partenza Disponibili",
      selectFromDates: "Seleziona da",
      availableDates: "date disponibili",
      whenCruisesDock: "quando le crociere attraccano a questa destinazione.",
      quickSelect: "Selezione Rapida:",
      mscCruises: "Crociere MSC",
      costaCruises: "Crociere COSTA",
      clickCalendar: "Clicca sul calendario per più date",
      noUpcomingDates: "Nessuna data di crociera imminente disponibile",
      notScheduled: "Questo tour non è attualmente programmato. Riprova più tardi.",
      gallery: "Galleria",
      bookThisTour: "Prenota Questo Tour",
      perPerson: "per persona",
      tourDate: "Data del Tour",
      pickDate: "Scegli una data",
      cruiseLine: "Compagnia di Crociera",
      passengers: "Passeggeri",
      adults: "Adulti",
      children: "Bambini",
      adultsAge: "Età 13+",
      childrenAge: "Età 2-12",
      total: "Totale",
      bookNow: "Prenota Ora",
      currentlyUnavailable: "Attualmente Non Disponibile",
      selectDateToBook: "Seleziona Data per Prenotare",
      maximumPassengers: "Massimo",
      passengersPerBooking: "passeggeri per prenotazione",
      noUpcomingDatesShort: "Nessuna data imminente",
      notScheduledShort: "Questo tour non è attualmente programmato. Riprova più tardi.",
      availableTourDates: "Date Tour Disponibili",
      mscCruiseDays: "Giorni Crociera MSC",
      costaCruiseDays: "Giorni Crociera COSTA",
      nextAvailableDates: "Prossime date disponibili:",
      maxPeople: "Max",
      people: "persone",
      hours: "ore",
      supplements: "Supplementi Opzionali",
      supplementsPrice: "Supplementi",
      free: "Gratis",
      enhanceExperience: "Migliora la Tua Esperienza",
      addSupplement: "Aggiungi Supplemento",
      proceedWithout: "Procedi Senza",
      supplementAvailable: "Supplemento Disponibile",
      fullExperience: "Per l'esperienza completa, considera di aggiungere il supplemento:",
    },
    ar: {
      backToTours: "العودة إلى الجولات",
      available: "متاح",
      unavailable: "غير متاح",
      aboutThisTour: "حول هذه الجولة",
      cruiseSchedule: "جدول الرحلات البحرية",
      availableDepartureDates: "تواريخ المغادرة المتاحة",
      selectFromDates: "اختر من",
      availableDates: "تواريخ متاحة",
      whenCruisesDock: "عندما ترسو الرحلات البحرية في هذه الوجهة.",
      quickSelect: "اختيار سريع:",
      mscCruises: "رحلات MSC البحرية",
      costaCruises: "رحلات COSTA البحرية",
      clickCalendar: "انقر على التقويم لمزيد من التواريخ",
      noUpcomingDates: "لا توجد تواريخ رحلات بحرية قادمة متاحة",
      notScheduled: "هذه الجولة غير مجدولة حالياً. يرجى المحاولة لاحقاً.",
      gallery: "المعرض",
      bookThisTour: "احجز هذه الجولة",
      perPerson: "للشخص الواحد",
      tourDate: "تاريخ الجولة",
      pickDate: "اختر تاريخاً",
      cruiseLine: "خط الرحلات البحرية",
      passengers: "الركاب",
      adults: "البالغون",
      children: "الأطفال",
      adultsAge: "العمر 13+",
      childrenAge: "العمر 2-12",
      total: "المجموع",
      bookNow: "احجز الآن",
      currentlyUnavailable: "غير متاح حالياً",
      selectDateToBook: "اختر تاريخاً للحجز",
      maximumPassengers: "الحد الأقصى",
      passengersPerBooking: "راكب لكل حجز",
      noUpcomingDatesShort: "لا توجد تواريخ قادمة",
      notScheduledShort: "هذه الجولة غير مجدولة حالياً. يرجى المحاولة لاحقاً.",
      availableTourDates: "تواريخ الجولات المتاحة",
      mscCruiseDays: "أيام رحلات MSC البحرية",
      costaCruiseDays: "أيام رحلات COSTA البحرية",
      nextAvailableDates: "التواريخ المتاحة التالية:",
      maxPeople: "الحد الأقصى",
      people: "أشخاص",
      hours: "ساعات",
      supplements: "إضافات اختيارية",
      supplementsPrice: "الإضافات",
      free: "مجاني",
      enhanceExperience: "حسّن تجربتك",
      addSupplement: "أضف الإضافة",
      proceedWithout: "المتابعة بدون",
      supplementAvailable: "الإضافة متاحة",
      fullExperience: "للتجربة الكاملة، فكر في إضافة الإضافة:",
    },
  }

  const t = translations[language]
  const isRTL = language === "ar"

  const handleSupplementChange = (supplement: Supplement, isChecked: boolean) => {
    setSelectedSupplements((prev) => {
      if (isChecked) {
        return [...prev, supplement]
      } else {
        return prev.filter((s) => s.name !== supplement.name)
      }
    })
  }

  // Function to get tour image
  const getTourImage = (tour: Tour) => {
    if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
      return tour.images[0]
    }

    const name = tour.name?.toLowerCase() || ""
    const location = tour.location_name?.toLowerCase() || ""

    if (name.includes("desert") || name.includes("safari") || location.includes("desert")) {
      return "/vast-desert-landscape.png"
    } else if (name.includes("city") || name.includes("doha") || location.includes("doha")) {
      return "/vibrant-cityscape.png"
    } else if (name.includes("museum") || name.includes("culture") || name.includes("heritage")) {
      return "/museum-interior.png"
    } else {
      return "/vast-desert-landscape.png"
    }
  }

  // Function to get tour description based on language
  const getTourDescription = (tour: Tour) => {
    if (language === "it" && tour.description_it) {
      return tour.description_it
    }
    return tour.description || ""
  }

  // Function to format duration
  const formatDuration = (duration: string) => {
    if (!duration) return ""

    // Extract numbers from duration string
    const match = duration.match(/(\d+)/)
    if (match) {
      const hours = match[1]
      return `${hours} ${t.hours}`
    }
    return duration
  }

  const handleBookNow = () => {
    if (!selectedDate) {
      const alertMessage =
        language === "ar"
          ? "يرجى اختيار تاريخ للجولة"
          : language === "it"
            ? "Seleziona una data per il tour"
            : "Please select a date for your tour"
      alert(alertMessage)
      return
    }

    // Proceed to checkout
    proceedToCheckout()
  }

  const proceedToCheckout = () => {
    // Get cruise line for selected date (fallback to MSC for test dates)
    const cruiseLine = hasScheduledDates ? getCruiseLineForDate(tour.id, selectedDate!) : "MSC"

    // Create booking data
    const bookingData = {
      tourId: tour.id,
      tourName: tour.name,
      date: formatDateToYYYYMMDD(selectedDate!),
      adults,
      children,
      totalPax,
      totalPrice,
      adultPrice: tour.price,
      childrenPrice: tour.children_price || 0,
      cruiseLine,
      supplements: selectedSupplements,
    }

    // Store booking data in sessionStorage for checkout
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData))

    // Navigate to checkout
    router.push("/checkout")
  }



  const incrementAdults = () => {
    if (tour.capacity && totalPax < tour.capacity) {
      setAdults(adults + 1)
    } else if (!tour.capacity) {
      setAdults(adults + 1)
    }
  }

  const decrementAdults = () => {
    if (adults > 1) {
      setAdults(adults - 1)
    }
  }

  const incrementChildren = () => {
    if (tour.capacity && totalPax < tour.capacity) {
      setChildren(children + 1)
    } else if (!tour.capacity) {
      setChildren(children + 1)
    }
  }

  const decrementChildren = () => {
    if (children > 0) {
      setChildren(children - 1)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className={`inline-flex items-center text-blue-600 hover:text-blue-800 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
            {t.backToTours}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? "lg:grid-cols-3" : ""}`}>
          {/* Tour Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Tour Image */}
                <div className="relative h-64 sm:h-80 lg:h-96">
                  <Image
                    src={getTourImage(tour) || "/placeholder.svg"}
                    alt={tour.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}>
                    <Badge
                      className={`${
                        tour.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                      } text-white`}
                    >
                      {tour.status === "active" ? t.available : t.unavailable}
                    </Badge>
                  </div>
                </div>

                {/* Tour Info */}
                <div className="p-6">
                  <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-4 ${isRTL ? "text-right" : ""}`}>
                    {tour.name}
                  </h1>

                  <div className={`flex flex-wrap gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {tour.location_name && (
                      <div className={`flex items-center text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <MapPin className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                        <span>{tour.location_name}</span>
                      </div>
                    )}
                    {tour.duration && (
                      <div className={`flex items-center text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Clock className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                        <span>{formatDuration(tour.duration)}</span>
                      </div>
                    )}

                  </div>

                  {getTourDescription(tour) && (
                    <div className="mb-6">
                      <h2 className={`text-xl font-semibold mb-3 ${isRTL ? "text-right" : ""}`}>{t.aboutThisTour}</h2>
                      <p className={`text-gray-700 leading-relaxed ${isRTL ? "text-right" : ""}`}>
                        {getTourDescription(tour)}
                      </p>
                    </div>
                  )}

                  {/* Cruise Schedule Information */}
                  <div className="mb-6">
                    <h2 className={`text-xl font-semibold mb-3 ${isRTL ? "text-right" : ""}`}>{t.cruiseSchedule}</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                      <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Ship className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-800">{t.availableDepartureDates}</span>
                      </div>
                      {availableDates.length > 0 ? (
                        <div className="space-y-3">
                          <p className={`text-sm text-gray-700 ${isRTL ? "text-right" : ""}`}>
                            {t.selectFromDates}{" "}
                            <span className="font-semibold text-blue-600">
                              {availableDates.length} {t.availableDates}
                            </span>{" "}
                            {databaseDates.length > 0
                              ? "saved for this tour."
                              : hasScheduledDates
                                ? t.whenCruisesDock
                                : "for testing purposes."}
                          </p>

                          {/* Quick Date Selection - Show all dates */}
                          <div className="space-y-2">
                            <p className={`text-sm font-medium text-gray-700 ${isRTL ? "text-right" : ""}`}>
                              {t.quickSelect}
                            </p>
                            <div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              {nextAvailableDates.map((date, index) => {
                                const cruiseLine = hasScheduledDates ? getCruiseLineForDate(tour.id, date) : "MSC"
                                const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setSelectedDate(date)
                                      setIsCalendarOpen(false)
                                    }}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : cruiseLine === "MSC"
                                          ? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                                          : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                                    }`}
                                  >
                                    <div className="font-medium">{format(date, "MMM dd")}</div>
                                    <div className="text-xs opacity-75">{cruiseLine}</div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div
                            className={`text-center text-xs text-gray-600 pt-2 border-t ${isRTL ? "text-right" : ""}`}
                          >
                            <span>{t.clickCalendar}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-600 mb-2">{t.noUpcomingDates}</p>
                          <p className="text-xs text-gray-500">{t.notScheduled}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  {tour.images && tour.images.length > 1 && (
                    <div className="mb-6">
                      <h2 className={`text-xl font-semibold mb-3 ${isRTL ? "text-right" : ""}`}>{t.gallery}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {tour.images.slice(1, 7).map((image, index) => (
                          <div key={index} className="relative h-24 sm:h-32">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`${tour.name} - Image ${index + 2}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span>{t.bookThisTour}</span>
                  <div className={`text-right ${isRTL ? "text-left" : ""}`}>
                    <div
                      className={`flex items-center text-2xl font-bold text-green-600 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <Euro className={`h-6 w-6 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {tour.price}
                      <span className={`text-sm text-gray-500 ${isRTL ? "mr-1" : "ml-1"}`}>{t.adults}</span>
                    </div>
                    {tour.children_price && tour.children_price > 0 && (
                      <div
                        className={`flex items-center text-lg font-semibold text-blue-600 mt-1 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <Euro className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                        {tour.children_price}
                        <span className={`text-sm text-gray-500 ${isRTL ? "mr-1" : "ml-1"}`}>{t.children}</span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection with React DatePicker */}
                <div className="space-y-2">
                  <Label htmlFor="tour-date" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <CalendarIcon className="h-4 w-4 text-[#6b0f1a]" />
                    {t.tourDate}
                  </Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    includeDates={availableDates}
                    minDate={new Date()}
                    dateFormat="PPP"
                    placeholderText={t.pickDate}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                    dayClassName={(date) => {
                      const isIncluded = availableDates.some(
                        (availableDate) => availableDate.toDateString() === date.toDateString(),
                      )
                      if (isIncluded) {
                        const cruiseLine = hasScheduledDates ? getCruiseLineForDate(tour.id, date) : "MSC"
                        if (cruiseLine === "MSC") {
                          return "bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                        } else if (cruiseLine === "COSTA") {
                          return "bg-green-100 text-green-700 hover:bg-green-200 font-semibold"
                        }
                        return "bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold"
                      }
                      return ""
                    }}
                    openToDate={availableDates.length > 0 ? availableDates[0] : new Date(2025, 7, 1)}
                  />
                  {/* Cruise line display hidden as requested */}
                  {/* {selectedDate && (
                    <div className={`text-sm text-gray-600 ${isRTL ? "text-right" : ""}`}>
                      <span className="font-medium">{t.cruiseLine}: </span>
                      <Badge variant="outline" className={isRTL ? "mr-1" : "ml-1"}>
                        {hasScheduledDates ? getCruiseLineForDate(tour.id, selectedDate) : "MSC"}
                      </Badge>
                    </div>
                  )} */}
                </div>

                {/* Passenger Selection */}
                <div>
                  <Label className={isRTL ? "text-right" : ""}>{t.passengers}</Label>
                  <div className="space-y-4 mt-2">
                    {/* Adults */}
                    <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={isRTL ? "text-right" : ""}>
                        <div className="font-medium">{t.adults}</div>
                        <div className="text-sm text-gray-500">{t.adultsAge}</div>
                      </div>
                      <div className={`flex items-center space-x-3 ${isRTL ? "space-x-reverse" : ""}`}>
                        <Button variant="outline" size="sm" onClick={decrementAdults} disabled={adults <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{adults}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={incrementAdults}
                          disabled={tour.capacity ? totalPax >= tour.capacity : false}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={isRTL ? "text-right" : ""}>
                        <div className="font-medium">{t.children}</div>
                        <div className="text-sm text-gray-500">{t.childrenAge}</div>
                      </div>
                      <div className={`flex items-center space-x-3 ${isRTL ? "space-x-reverse" : ""}`}>
                        <Button variant="outline" size="sm" onClick={decrementChildren} disabled={children <= 0}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{children}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={incrementChildren}
                          disabled={tour.capacity ? totalPax >= tour.capacity : false}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplements Section */}
                {supplements.length > 0 && (
                  <div>
                    <Label className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <PlusCircle className="h-4 w-4 text-blue-600" />
                      {t.supplements}
                    </Label>
                    <div className="space-y-3 mt-2">
                      {supplements.map((supplement, index) => (
                        <div
                          key={index}
                          className={`flex items-start justify-between p-3 border rounded-md bg-white ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`flex items-start gap-3 flex-1 ${isRTL ? "gap-3 flex-row-reverse" : ""}`}>
                            <Checkbox
                              id={`supplement-${index}`}
                              onCheckedChange={(checked) => handleSupplementChange(supplement, !!checked)}
                              checked={selectedSupplements.some((s) => s.name === supplement.name)}
                              aria-label={supplement.name}
                              className="mt-1"
                            />
                            <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                              <label
                                htmlFor={`supplement-${index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {supplement.name}
                              </label>
                              {supplement.description && (
                                <p className="text-xs text-gray-500 mt-1">{supplement.description}</p>
                              )}
                              <div className="text-xs text-gray-600 mt-1">
                                <span>Adults: €{supplement.price}</span>
                                {supplement.childrenPrice !== undefined && (
                                  <span className="ml-2">
                                    Children: {supplement.childrenPrice === 0 ? t.free : `€${supplement.childrenPrice}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`font-semibold text-sm text-gray-700 ${isRTL ? "mr-3" : "ml-3"}`}>
                            +€{supplement.price * adults + (supplement.childrenPrice || supplement.price) * children}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  {adults > 0 && (
                    <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>
                        €{tour.price} × {adults} {adults === 1 ? t.adults.slice(0, -1) : t.adults.toLowerCase()}
                      </span>
                      <span>€{tour.price * adults}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>
                        €{tour.children_price || 0} × {children}{" "}
                        {children === 1 ? t.children.slice(0, -1) : t.children.toLowerCase()}
                      </span>
                      <span>€{(tour.children_price || 0) * children}</span>
                    </div>
                  )}
                  {selectedSupplements.length > 0 && (
                    <div className={`flex justify-between text-sm text-blue-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t.supplementsPrice}</span>
                      <span>€{supplementsPrice}</span>
                    </div>
                  )}
                  <div className={`flex justify-between font-semibold text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span>{t.total}</span>
                    <span>€{totalPrice}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={handleBookNow}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={tour.status !== "active" || !selectedDate}
                >
                  {tour.status !== "active" ? t.currentlyUnavailable : !selectedDate ? t.selectDateToBook : t.bookNow}
                </Button>



                {availableDates.length === 0 && (
                  <div
                    className={`text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg ${isRTL ? "text-right" : ""}`}
                  >
                    <p className="font-medium">{t.noUpcomingDatesShort}</p>
                    <p>{t.notScheduledShort}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


    </div>
  )
}

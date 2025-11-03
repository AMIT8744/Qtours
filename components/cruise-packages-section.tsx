"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Star, MapPin, Users, Ship } from "lucide-react"
import { getPackages, type Package } from "@/app/actions/packages-actions"
import { useEffect } from "react"

interface CruisePackagesSectionProps {
  language: "it" | "en" | "es" | "de"
}

export function CruisePackagesSection({ language }: CruisePackagesSectionProps) {
  const translations = {
    en: {
      title: "Cruise Excursion Packages",
      subtitle: "Specially designed packages for MSC and Costa cruise passengers",
      adultPrice: "Adult",
      childPrice: "Child",
      bookNow: "Book Now",
      popular: "Popular",
      includes: "Includes:",
      italianGuide: "Italian-speaking guide",
      guaranteedReturn: "Guaranteed return to ship",
      smallGroups: "Small groups",
      selectPassengers: "Select Passengers",
      adults: "Adults",
      children: "Children",
      adultsAge: "Ages 13+",
      childrenAge: "Ages 2-12",
      totalPrice: "Total Price",
      proceedToCheckout: "Proceed to Checkout",
    },
    it: {
      title: "Pacchetti Escursioni Crociere",
      subtitle: "Pacchetti appositamente progettati per i passeggeri delle crociere MSC e Costa",
      adultPrice: "Adulti",
      childPrice: "Bambini",
      bookNow: "Prenota Ora",
      popular: "Popolare",
      includes: "Include:",
      italianGuide: "Guida italiana",
      guaranteedReturn: "Rientro garantito alla nave",
      smallGroups: "Piccoli gruppi",
      selectPassengers: "Seleziona Passeggeri",
      adults: "Adulti",
      children: "Bambini",
      adultsAge: "Età 13+",
      childrenAge: "Età 2-12",
      totalPrice: "Prezzo Totale",
      proceedToCheckout: "Procedi al Checkout",
    },
    es: {
      title: "Paquetes de Excursiones de Crucero",
      subtitle: "Paquetes especialmente diseñados para pasajeros de cruceros MSC y Costa",
      adultPrice: "Adulto",
      childPrice: "Niño",
      bookNow: "Reservar Ahora",
      popular: "Popular",
      includes: "Incluye:",
      italianGuide: "Guía italiano",
      guaranteedReturn: "Regreso garantizado al barco",
      smallGroups: "Grupos pequeños",
      selectPassengers: "Seleccionar Pasajeros",
      adults: "Adultos",
      children: "Niños",
      adultsAge: "Edades 13+",
      childrenAge: "Edades 2-12",
      totalPrice: "Precio Total",
      proceedToCheckout: "Proceder al Checkout",
    },
    de: {
      title: "Kreuzfahrt-Ausflugspakete",
      subtitle: "Speziell entwickelte Pakete für MSC- und Costa-Kreuzfahrtpassagiere",
      adultPrice: "Erwachsener",
      childPrice: "Kind",
      bookNow: "Jetzt Buchen",
      popular: "Beliebt",
      includes: "Beinhaltet:",
      italianGuide: "Italienischer Guide",
      guaranteedReturn: "Garantierte Rückkehr zum Schiff",
      smallGroups: "Kleine Gruppen",
      selectPassengers: "Passagiere Auswählen",
      adults: "Erwachsene",
      children: "Kinder",
      adultsAge: "Alter 13+",
      childrenAge: "Alter 2-12",
      totalPrice: "Gesamtpreis",
      proceedToCheckout: "Zur Kasse Gehen",
    },
  }

  const t = translations[language]
  const router = useRouter()
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const fetchedPackages = await getPackages()
        setPackages(fetchedPackages)
      } catch (error) {
        console.error("Error fetching packages:", error)
      }
    }

    fetchPackages()
  }, [])

  const handleBookPackage = (pkg: Package) => {
    setSelectedPackage(pkg)
    setAdults(1)
    setChildren(0)
    setIsBookingModalOpen(true)
  }

  const handleProceedToCheckout = () => {
    if (!selectedPackage) return

    const totalPrice = adults * selectedPackage.adult_price + children * selectedPackage.child_price
    const totalPax = adults + children

    // Store booking data in session storage
    const bookingData = {
      packageId: selectedPackage.id,
      tourId: selectedPackage.id, // Use package ID as tour ID for compatibility
      tourName: selectedPackage.name,
      packageName: selectedPackage.name,
      date: new Date().toISOString(), // Use current date as placeholder
      adults,
      children,
      totalPax,
      totalPrice,
      pricePerPerson: totalPrice / totalPax,
      adultPrice: selectedPackage.adult_price,
      childPrice: selectedPackage.child_price,
      isPackage: true, // Flag to identify this is a package booking
    }

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData))
    setIsBookingModalOpen(false)
    router.push("/checkout")
  }

  const getGradientClass = (colorScheme: string) => {
    return colorScheme === "blue" 
      ? "from-blue-500 to-cyan-600" 
      : "from-purple-500 to-indigo-600"
  }

  const getBgColor = (colorScheme: string) => {
    return colorScheme === "blue" ? "bg-blue-50" : "bg-purple-50"
  }

  const getBorderColor = (colorScheme: string) => {
    return colorScheme === "blue" ? "border-blue-200" : "border-purple-200"
  }

  if (packages.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{t.subtitle}</p>
            <p className="text-gray-500">No packages available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h2>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden hover:shadow-lg transition-shadow duration-300 ${getBgColor(pkg.color_scheme)} ${getBorderColor(pkg.color_scheme)}`}
            >
              {pkg.is_popular && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  {t.popular}
                </div>
              )}

              <CardHeader className="pb-4">
                                 <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradientClass(pkg.color_scheme)} flex items-center justify-center`}>
                     <Ship className="h-6 w-6 text-white" />
                   </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{pkg.name}</CardTitle>
                    <p className="text-gray-600 mt-1">{pkg.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">{t.includes}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{t.italianGuide}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{t.guaranteedReturn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{t.smallGroups}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">€{pkg.adult_price}</span>
                    <span className="text-sm text-gray-600">{t.adultPrice}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold text-gray-700">€{pkg.child_price}</span>
                    <span className="text-sm text-gray-600">{t.childPrice}</span>
                  </div>

                  <Button
                    onClick={() => handleBookPackage(pkg)}
                    className={`w-full bg-gradient-to-r ${getGradientClass(pkg.color_scheme)} hover:opacity-90 text-white font-semibold py-3`}
                  >
                    {t.bookNow}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.selectPassengers}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedPackage && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedPackage.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedPackage.description}</p>
                <div className="flex justify-between text-sm">
                  <span>{t.adultPrice}: €{selectedPackage.adult_price}</span>
                  <span>{t.childPrice}: €{selectedPackage.child_price}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="adults">{t.adults}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                  >
                    -
                  </Button>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdults(adults + 1)}
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-600 ml-2">{t.adultsAge}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="children">{t.children}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                  >
                    -
                  </Button>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChildren(children + 1)}
                  >
                    +
                  </Button>
                  <span className="text-sm text-gray-600 ml-2">{t.childrenAge}</span>
                </div>
              </div>
            </div>

            {selectedPackage && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">{t.totalPrice}:</span>
                  <span className="text-xl font-bold text-gray-900">
                    €{(adults * selectedPackage.adult_price + children * selectedPackage.child_price).toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#6b0f1a] hover:bg-[#8a1325] text-white font-semibold py-3"
                >
                  {t.proceedToCheckout}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

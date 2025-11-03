"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { MapPin, Users, Star, Globe, Heart, User, Menu, X, Eye, ArrowRight } from "lucide-react"
import { ToursSection } from "@/components/tours-section"
import { WhyChooseUsSection } from "@/components/why-choose-us-section"
import { CruisePackagesSection } from "@/components/cruise-packages-section"
import { TestimonialsSection } from "@/components/testimonials-section"

interface Tour {
  id: string
  name: string
  description?: string
  price: number
  location?: string
  location_name?: string
  duration?: string
  capacity?: number
  images?: string[]
  status: string
}

interface LandingPageClientProps {
  initialTours: Tour[]
}

export default function LandingPageClient({ initialTours }: LandingPageClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<"en" | "it" | "es" | "de">("it")
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [searchData, setSearchData] = useState({
    destination: "",
    date: undefined as Date | undefined,
    adults: 0,
    children: 0,
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Load saved language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("viaggi-del-qatar-language") as "en" | "it" | "es" | "de" | null
    if (savedLanguage && ["en", "it", "es", "de"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
      console.log("Loaded saved language:", savedLanguage)
    }
  }, [])

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("viaggi-del-qatar-language", language)
    console.log("Saved language to localStorage:", language)
  }, [language])

  // Check for URL language parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const langParam = searchParams.get("lang")

    if (langParam === "it") {
      setLanguage("it")
      localStorage.setItem("viaggi-del-qatar-language", "it")
      console.log("Language forced to Italian via URL parameter")
    }
  }, [])

  const scrollToTours = (e: React.MouseEvent) => {
    e.preventDefault()
    const toursSection = document.getElementById("tours")
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToPackages = (e: React.MouseEvent) => {
    e.preventDefault()
    const packagesSection = document.getElementById("packages")
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault()
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const translations = {
    en: {
      // Header
      destinations: "Destinations",
      adventureStyles: "Excursions",
      deals: "Deals",
      contact: "Contact",
      getApp: "Get app",
      admin: "Admin",

      // Language modal
      selectLanguage: "Select Language",
      italian: "Italian",
      spanish: "Spanish",
      german: "German",
      english: "English",

      // Hero
      heroTitle: "Italian Excursions in the Emirates - Qatar - Oman and Bahrain",
      heroHighlight: "We specialize in Italian excursions for cruise passengers on all MSC and Costa ships",
      heroDescription1:
        "Our excursions allow you to visit all places of interest in every city of your cruise in the Emirates. Accompanied by our Italian staff, you'll explore everything without rush, spending less and returning on perfect time for all aboard.",
      heroDescription2:
        "We are the only ones to guarantee Italian excursions on all MSC and Costa ships in the Emirates, Qatar, Oman and Bahrain. We also offer packages with stopovers in these cities combined with the Maldives.",
      heroDescription3: "Soon we will offer excursions in Saudi Arabia and Jordan for cruise passengers.",

      // Group size
      adults: "Adults",
      children: "Children",
      adultsAge: "Ages 13 or above",
      childrenAge: "Ages 2-12",

      // Why choose us
      whyChooseTitle: "Why Choose Viaggi Del Qatar?",
      whyChooseSubtitle:
        "Experience the Emirates like never before with our expertly curated tours and exceptional Italian service",
      expertGuides: "Italian Speaking Guides",
      expertGuidesDesc: "Our Italian-speaking guides bring the Emirates' history and culture to life",
      uniqueExperiences: "Cruise Specialized",
      uniqueExperiencesDesc: "Tailored excursions designed specifically for cruise passengers' schedules",
      smallGroups: "Guaranteed Return",
      smallGroupsDesc: "We guarantee your timely return to the ship for all aboard",

      // Footer
      footerDesc: "Your gateway to unforgettable Emirates adventures with Italian-speaking guides.",
      quickLinks: "Quick Links",
      aboutUs: "About Us",
      ourTours: "Our Tours",
      faq: "FAQ",
      support: "Support",
      helpCenter: "Help Center",
      bookingPolicy: "Booking Policy",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      contactInfo: "Contact Info",
      allRightsReserved: "All rights reserved",
    },
    it: {
      // Header
      destinations: "Destinazioni",
      adventureStyles: "Escursioni",
      deals: "Offerte",
      contact: "Contatti",
      getApp: "Scarica app",
      admin: "Admin",

      // Language modal
      selectLanguage: "Seleziona Lingua",
      italian: "Italiano",
      spanish: "Spagnolo",
      german: "Tedesco",
      english: "Inglese",

      // Hero
      heroTitle: "Escursioni in Italiano negli Emirati -Qatar-Oman  e Bahrain",
      heroHighlight:
        "Siamo specializzati nelle escursioni in Italiano per i Crocieristi su tutte le tappe di MSC e Costa",
      heroDescription1:
        "Le nostre escursioni vi permettono di visitare tutti i luoghi di interesse di ogni città della vostra crociera negli emirati. Coccolati dal nostro Staff Italiano, esplorerete tutto senza fretta, spendendo meno e tornando in perfetto orario per all aboard.",
      heroDescription2:
        "Siamo gli unici a garantirVi sempre le Escursioni in Italiano su tutte le tappe di MSC e COSTA negli Emirati in Qatar, Oman e Bahrain. Offriamo anche pacchetti con stopover in queste città abbinati alle Maldive.",
      heroDescription3: "A breve offriremo escursioni anche in Arabia Saudita ed in Giordania per i Crocieristi.",

      // Group size
      adults: "Adulti",
      children: "Bambini",
      adultsAge: "Età 13 anni o superiore",
      childrenAge: "Età 2-12 anni",

      // Why choose us
      whyChooseTitle: "Perché Scegliere Viaggi Del Qatar?",
      whyChooseSubtitle:
        "Vivi gli Emirati come mai prima d'ora con i nostri tour curati da esperti e il servizio eccezionale in italiano",
      expertGuides: "Guide Italiane",
      expertGuidesDesc: "Le nostre guide italiane danno vita alla storia e alla cultura degli Emirati",
      uniqueExperiences: "Specializzati Crociere",
      uniqueExperiencesDesc: "Escursioni su misura progettate specificamente per gli orari dei crocieristi",
      smallGroups: "Rientro Garantito",
      smallGroupsDesc: "Garantiamo il vostro rientro puntuale alla nave per l'all aboard",

      // Footer
      footerDesc: "La tua porta d'accesso a avventure indimenticabili negli Emirati con guide italiane.",
      quickLinks: "Link Rapidi",
      aboutUs: "Chi Siamo",
      ourTours: "I Nostri Tour",
      faq: "Domande Frequenti",
      support: "Supporto",
      helpCenter: "Centro Assistenza",
      bookingPolicy: "Politica di Prenotazione",
      privacyPolicy: "Politica sulla Privacy",
      termsOfService: "Termini di Servizio",
      contactInfo: "Informazioni di Contatto",
      allRightsReserved: "Tutti i diritti riservati",
    },
    es: {
      // Header
      destinations: "Destinos",
      adventureStyles: "Excursiones",
      deals: "Ofertas",
      contact: "Contacto",
      getApp: "Descargar app",
      admin: "Admin",

      // Language modal
      selectLanguage: "Seleccionar Idioma",
      italian: "Italiano",
      spanish: "Español",
      german: "Alemán",
      english: "Inglés",

      // Hero
      heroTitle: "Excursiones para Cruceristas en los Emiratos y Más Allá",
      heroHighlight:
        "Nos especializamos en excursiones en italiano para cruceristas en todas las escalas de MSC y Costa",
      heroDescription1:
        "Nuestras excursiones te permiten visitar todos los lugares de interés de cada ciudad de tu crucero en los emiratos. Acompañados por nuestro personal italiano, explorarás todo sin prisa, gastando menos y regresando a tiempo perfecto para el all aboard.",
      heroDescription2:
        "Somos los únicos en garantizar siempre excursiones en italiano en todas las escalas de MSC y COSTA en los Emiratos, Qatar, Omán y Bahréin. También ofrecemos paquetes con escalas en estas ciudades combinadas con las Maldivas.",
      heroDescription3: "Pronto ofreceremos excursiones también en Arabia Saudí y Jordania para cruceristas.",

      // Group size
      adults: "Adultos",
      children: "Niños",
      adultsAge: "Edades 13 años o más",
      childrenAge: "Edades 2-12 años",

      // Why choose us
      whyChooseTitle: "¿Por Qué Elegir Viaggi Del Qatar?",
      whyChooseSubtitle:
        "Experimenta los Emiratos como nunca antes con nuestros tours expertamente curados y servicio excepcional en italiano",
      expertGuides: "Guías Italianos",
      expertGuidesDesc: "Nuestros guías italianos dan vida a la historia y cultura de los Emiratos",
      uniqueExperiences: "Especializados en Cruceros",
      uniqueExperiencesDesc: "Excursiones a medida diseñadas específicamente para los horarios de cruceristas",
      smallGroups: "Regreso Garantizado",
      smallGroupsDesc: "Garantizamos tu regreso puntual al barco para el all aboard",

      // Footer
      footerDesc: "Tu puerta de entrada a aventuras inolvidables en los Emiratos con guías italianos.",
      quickLinks: "Enlaces Rápidos",
      aboutUs: "Acerca de Nosotros",
      ourTours: "Nuestros Tours",
      faq: "Preguntas Frecuentes",
      support: "Soporte",
      helpCenter: "Centro de Ayuda",
      bookingPolicy: "Política de Reservas",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",
      contactInfo: "Información de Contacto",
      allRightsReserved: "Todos los derechos reservados",
    },
    de: {
      // Header
      destinations: "Reiseziele",
      adventureStyles: "Ausflüge",
      deals: "Angebote",
      contact: "Kontakt",
      getApp: "App herunterladen",
      admin: "Admin",

      // Language modal
      selectLanguage: "Sprache Auswählen",
      italian: "Italienisch",
      spanish: "Spanisch",
      german: "Deutsch",
      english: "Englisch",

      // Hero
      heroTitle: "Ausflüge für Kreuzfahrtpassagiere in den Emiraten und Darüber Hinaus",
      heroHighlight:
        "Wir sind spezialisiert auf italienische Ausflüge für Kreuzfahrtpassagiere auf allen MSC- und Costa-Schiffen",
      heroDescription1:
        "Unsere Ausflüge ermöglichen es Ihnen, alle Sehenswürdigkeiten jeder Stadt Ihrer Kreuzfahrt in den Emiraten zu besuchen. Begleitet von unserem italienischen Personal erkunden Sie alles ohne Eile, geben weniger aus und kehren pünktlich für das All Aboard zurück.",
      heroDescription2:
        "Wir sind die einzigen, die immer italienische Ausflüge auf allen MSC- und COSTA-Stopps in den Emiraten, Katar, Oman und Bahrain garantieren. Wir bieten auch Pakete mit Zwischenstopps in diesen Städten kombiniert mit den Malediven an.",
      heroDescription3:
        "Bald werden wir auch Ausflüge in Saudi-Arabien und Jordanien für Kreuzfahrtpassagiere anbieten.",

      // Group size
      adults: "Erwachsene",
      children: "Kinder",
      adultsAge: "Alter 13 Jahre oder älter",
      childrenAge: "Alter 2-12 Jahre",

      // Why choose us
      whyChooseTitle: "Warum Viaggi Del Qatar Wählen?",
      whyChooseSubtitle:
        "Erleben Sie die Emirate wie nie zuvor mit unseren fachmännisch kuratierten Touren und außergewöhnlichem italienischen Service",
      expertGuides: "Italienische Guides",
      expertGuidesDesc: "Unsere italienischsprachigen Guides erwecken die Geschichte und Kultur der Emirate zum Leben",
      uniqueExperiences: "Kreuzfahrt-Spezialisiert",
      uniqueExperiencesDesc: "Maßgeschneiderte Ausflüge speziell für Kreuzfahrtpassagier-Zeitpläne entwickelt",
      smallGroups: "Garantierte Rückkehr",
      uniqueExperiencesDesc: "Wir garantieren Ihre pünktliche Rückkehr zum Schiff für das All Aboard",

      // Footer
      footerDesc: "Ihr Tor zu unvergesslichen Emirate-Abenteuern mit italienischsprachigen Guides.",
      quickLinks: "Schnelle Links",
      aboutUs: "Über Uns",
      ourTours: "Unsere Touren",
      faq: "Häufige Fragen",
      support: "Support",
      helpCenter: "Hilfe-Center",
      bookingPolicy: "Buchungsrichtlinien",
      privacyPolicy: "Datenschutzrichtlinie",
      termsOfService: "Nutzungsbedingungen",
      contactInfo: "Kontaktinformationen",
      allRightsReserved: "Alle Rechte vorbehalten",
    },
  }

  const t = translations[language]

  const languages = [
    {
      code: "en" as const,
      name: t.english,
      flag: "https://flagsapi.com/GB/flat/64.png",
    },
    {
      code: "it" as const,
      name: t.italian,
      flag: "https://flagsapi.com/IT/flat/64.png",
    },
    {
      code: "es" as const,
      name: t.spanish,
      flag: "https://flagsapi.com/ES/flat/64.png",
    },
    {
      code: "de" as const,
      name: t.german,
      flag: "https://flagsapi.com/DE/flat/64.png",
    },
  ]

  const destinations =
    language === "es"
      ? [
          "Centro de Doha",
          "The Pearl Qatar",
          "Pueblo Cultural Katara",
          "Souq Waqif",
          "Museo de Arte Islámico",
          "Safari en el Desierto",
          "Fuerte de Al Zubarah",
          "Isla Banana",
          "Parque Aspire",
          "Paseo Marítimo Corniche",
        ]
      : language === "de"
        ? [
            "Doha Stadtzentrum",
            "The Pearl Qatar",
            "Katara Kulturelles Dorf",
            "Souq Waqif",
            "Museum für Islamische Kunst",
            "Wüsten-Safari",
            "Al Zubarah Fort",
            "Banana Island",
            "Aspire Park",
            "Corniche Uferpromenade",
          ]
        : language === "it"
          ? [
              "Centro di Doha",
              "The Pearl Qatar",
              "Villaggio Culturale Katara",
              "Souq Waqif",
              "Museo d'Arte Islamica",
              "Safari nel Deserto",
              "Forte di Al Zubarah",
              "Isola Banana",
              "Parco Aspire",
              "Lungomare Corniche",
            ]
          : [
              "Doha City Center",
              "The Pearl Qatar",
              "Katara Cultural Village",
              "Souq Waqif",
              "Museum of Islamic Art",
              "Desert Safari",
              "Al Zubarah Fort",
              "Banana Island",
              "Aspire Park",
              "Corniche Waterfront",
            ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLanguageSelect = (langCode: "en" | "it" | "es" | "de") => {
    setLanguage(langCode)
    setIsLanguageModalOpen(false)
    console.log("Language changed to:", langCode)
  }

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <div className="min-h-screen bg-white">
      {/* Language Selection Modal */}
      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-2xl z-50 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.selectLanguage}</h2>
          </div>
          <div className="space-y-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all hover:bg-gray-50 ${
                  language === lang.code ? "border-[#0ea5e9] bg-blue-50" : "border-gray-200"
                }`}
                style={{ gap: "1rem" }}
              >
                <Image
                  src={lang.flag || "/placeholder.svg"}
                  alt={`${lang.name} flag`}
                  width={48}
                  height={48}
                  className="rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <span className="text-lg font-medium text-gray-900 flex-1 text-start">{lang.name}</span>
                {language === lang.code && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#0ea5e9] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="https://escursionincrociera.com/wp-content/uploads/2024/05/Untitled-design.png"
                alt="Viaggi Del Qatar"
                width={32}
                height={32}
                className="rounded object-contain"
              />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#7f1d1d] truncate">Viaggi Del Qatar</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#destinations" className="text-gray-700 hover:text-[#7f1d1d] font-medium">
                {t.destinations}
              </Link>
              <Link href="#tours" className="text-gray-700 hover:text-[#7f1d1d] font-medium">
                {t.adventureStyles}
              </Link>
              <button
                onClick={scrollToPackages}
                className="text-gray-700 hover:text-[#7f1d1d] font-medium cursor-pointer"
              >
                {t.deals}
              </button>
              <button
                onClick={scrollToContact}
                className="text-gray-700 hover:text-[#7f1d1d] font-medium cursor-pointer"
              >
                {t.contact}
              </button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#7f1d1d] text-[#7f1d1d] hover:bg-[#7f1d1d] hover:text-white bg-transparent"
              >
                {t.getApp}
              </Button>
            </nav>

            {/* Desktop Right Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <Globe className="h-5 w-5 text-gray-600" />
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                className="flex items-center hover:bg-gray-100 px-2 py-1 rounded-md transition-colors space-x-2"
              >
                {currentLanguage && (
                  <Image
                    src={currentLanguage.flag || "/placeholder.svg"}
                    alt={`${currentLanguage.name} flag`}
                    width={20}
                    height={20}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <Heart className="h-5 w-5 text-gray-600" />
              <User className="h-5 w-5 text-gray-600" />
              <Link href="/admin" className="text-sm text-gray-600 hover:text-[#7f1d1d]">
                {t.admin}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#7f1d1d] hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-30">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="#destinations"
                className="block px-3 py-2 text-gray-700 hover:text-[#7f1d1d] hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.destinations}
              </Link>
              <Link
                href="#tours"
                className="block px-3 py-2 text-gray-700 hover:text-[#7f1d1d] hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.adventureStyles}
              </Link>
              <button
                onClick={(e) => {
                  scrollToPackages(e)
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#7f1d1d] hover:bg-gray-50 rounded-md"
              >
                {t.deals}
              </button>
              <button
                onClick={(e) => {
                  scrollToContact(e)
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#7f1d1d] hover:bg-gray-50 rounded-md"
              >
                {t.contact}
              </button>
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  onClick={() => setIsLanguageModalOpen(true)}
                  className="flex items-center hover:bg-gray-100 px-2 py-1 rounded-md transition-colors space-x-2"
                >
                  <Globe className="h-4 w-4 text-gray-600" />
                  {currentLanguage && (
                    <Image
                      src={currentLanguage.flag || "/placeholder.svg"}
                      alt={`${currentLanguage.name} flag`}
                      width={16}
                      height={16}
                      className="rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                  <span className="text-sm">{language.toUpperCase()}</span>
                </button>
                <Link href="/admin" className="text-sm text-[#7f1d1d] font-medium">
                  {t.admin} Login
                </Link>
              </div>
              <div className="px-3 py-2">
                <Button className="w-full bg-[#7f1d1d] hover:bg-[#5f1515] text-white">{t.getApp}</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[700px] lg:h-[800px] overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/vast-desert-landscape.png"
          >
            <source src="https://cdn.dakaei.com/qtours.mp4" type="video/mp4" />
            <Image src="/vast-desert-landscape.png" alt="Qatar Tours" fill className="object-cover" priority />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full text-white">
            {/* Constrained width container for text */}
            <div className="max-w-4xl">
              {/* Main Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                {t.heroTitle}
              </h1>

              {/* Highlighted Subtitle */}
              <div className="bg-orange-500 bg-opacity-90 rounded-lg p-3 mb-4 inline-block max-w-3xl">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white">{t.heroHighlight}</p>
              </div>

              {/* Description Paragraphs */}
              <div className="space-y-3 mb-6 text-gray-100 max-w-3xl">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">{t.heroDescription1}</p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">{t.heroDescription2}</p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed font-medium">{t.heroDescription3}</p>
              </div>

              {/* View Tours Button - Left Aligned */}
              <div className="flex justify-start">
                <Button
                  onClick={scrollToTours}
                  className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2 group"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {language === "es"
                    ? "Ver Tours"
                    : language === "de"
                      ? "Touren Ansehen"
                      : language === "it"
                        ? "Vedi Tour"
                        : "View Tours"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <ToursSection language={language} initialTours={initialTours} />

      {/* Cruise Packages Section */}
      <div id="packages">
        <CruisePackagesSection language={language} />
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection language={language} />

      {/* Why Choose Us Section - New */}
      <WhyChooseUsSection />

      {/* Why Choose Us Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t.whyChooseTitle}</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">{t.whyChooseSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-[#7f1d1d] rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.expertGuides}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t.expertGuidesDesc}</p>
            </div>

            <div className="text-center">
              <div className="bg-[#7f1d1d] rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.uniqueExperiences}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t.uniqueExperiencesDesc}</p>
            </div>

            <div className="text-center">
              <div className="bg-[#7f1d1d] rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{t.smallGroups}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t.smallGroupsDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4 space-x-2">
                <Image
                  src="https://escursionincrociera.com/wp-content/uploads/2024/05/Untitled-design.png"
                  alt="Viaggi Del Qatar"
                  width={32}
                  height={32}
                  className="rounded object-contain"
                />
                <span className="text-lg sm:text-xl font-bold">Viaggi Del Qatar</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">{t.footerDesc}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">{t.contactInfo}</h4>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <p>📧 booking@qtours.tours</p>
                <p>📧 palma@qtours.tours</p>
                <p>📞 +97455472952</p>
                <p>📍 Doha, Qatar</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>
              &copy; {new Date().getFullYear()} Viaggi Del Qatar. {t.allRightsReserved}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

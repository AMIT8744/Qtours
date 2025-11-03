"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, User } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Stefania Martines",
    role: "Private Tour",
    rating: 5,
    text: "Sono fantastici nell'organizzare tour adatti a tutte le preferenze. Il Safari nel deserto è assolutamente emozionante, offrendo un'esperienza piena di adrenalina in una location straordinaria. Anche il Tour della Città è eccezionalmente ben pianificato, portandoci in vari luoghi in una città veramente bella e in rapida crescita. Raccomando vivamente i loro tour.",
    image: "https://escursionincrociera.com/wp-content/uploads/2024/05/Rectangle-73.webp",
  },
  {
    id: 2,
    name: "Alessio Ghibellino",
    role: "Travel Agent",
    rating: 5,
    text: "I 'Viaggi del Qatar' (QTours) è veramente eccezionale. Sono affidabili, professionali, preparati, pazienti, amichevoli ed empatici. Grazie al loro incredibile servizio, siamo stati in grado di esplorare la splendida città di Doha, immergendoci nei vibranti profumi, suoni e colori del Qatar.",
    image: "https://escursionincrociera.com/wp-content/uploads/2024/05/3.webp",
  },
  {
    id: 3,
    name: "Arcangelo Lannutti",
    role: "Cruise Passenger",
    rating: 5,
    text: "Il tour è stato veramente bello e la nostra guida è stata estremamente professionale, fornendoci spiegazioni esaustive e dettagliate sulla storia della città e sui suoi punti di riferimento. Consiglio vivamente questo tour a chiunque sia interessato a esplorare la città e a conoscere la sua affascinante storia.",
    image: "https://escursionincrociera.com/wp-content/uploads/2024/05/Rectangle-72.webp",
  },
]

const translations = {
  it: {
    badge: "Testimonianze",
    title: "Clienti sempre soddisfatti",
    subtitle: "Le esperienze autentiche dei nostri clienti che hanno scoperto il Qatar con noi",
  },
  en: {
    badge: "Testimonials",
    title: "Always Satisfied Customers",
    subtitle: "Authentic experiences from our clients who discovered Qatar with us",
  },
  es: {
    badge: "Testimonios",
    title: "Clientes Siempre Satisfechos",
    subtitle: "Experiencias auténticas de nuestros clientes que descubrieron Qatar con nosotros",
  },
  de: {
    badge: "Erfahrungsberichte",
    title: "Immer Zufriedene Kunden",
    subtitle: "Authentische Erfahrungen unserer Kunden, die Katar mit uns entdeckt haben",
  },
}

interface TestimonialsSectionProps {
  language?: "it" | "en" | "es" | "de"
}

export function TestimonialsSection({ language = "it" }: TestimonialsSectionProps) {
  const t = translations[language]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100 text-amber-800 px-6 py-2 rounded-full text-sm font-medium mb-6">
            {t.badge}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t.title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Testimonial - Stefania Martines */}
          <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6 flex flex-col h-full">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 italic leading-relaxed flex-grow">
                "Sono fantastici nell'organizzare tour adatti a tutte le preferenze. Il Safari nel deserto è assolutamente emozionante, offrendo un'esperienza piena di adrenalina in una location straordinaria. Anche il Tour della Città è eccezionalmente ben pianificato, portandoci in vari luoghi in una città veramente bella e in rapida crescita. Raccomando vivamente i loro tour."
              </p>

              {/* Image */}
              <div className="mb-4">
                <img
                  src="https://i.ibb.co/MyJKjwR4/image.png"
                  alt="Stefania Martines - Private Tour"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Author Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Stefania Martines</p>
                    <p className="text-sm text-gray-600">Private Tour</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center Video */}
          <div className="relative rounded-lg overflow-hidden shadow-lg h-full">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              style={{ aspectRatio: '16/9', minHeight: '400px' }}
            >
              <source src="https://cdn.dakaei.com/qtours.mp4" type="video/mp4" />
              Il tuo browser non supporta il tag video.
            </video>
          </div>

          {/* Right Testimonial - Arcangelo Lannutti */}
          <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-amber-200 shadow-lg">
            <CardContent className="p-6 flex flex-col h-full">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 italic leading-relaxed flex-grow">
                "Il tour è stato veramente bello e la nostra guida è stata estremamente professionale, fornendoci spiegazioni esaustive e dettagliate sulla storia della città e sui suoi punti di riferimento. Consiglio vivamente questo tour a chiunque sia interessato a esplorare la città e a conoscere la sua affascinante storia."
              </p>

              {/* Image */}
              <div className="mb-4">
                <img
                  src="https://i.ibb.co/Mkszgb3m/image.png"
                  alt="Arcangelo Lannutti - Cruise Passenger"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Author Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Arcangelo Lannutti</p>
                    <p className="text-sm text-gray-600">Cruise Passenger</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Middle Testimonial - Alessio Ghibellino */}
        <div className="mt-8 lg:hidden">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-6">
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "I 'Viaggi del Qatar' (QTours) è veramente eccezionale. Sono affidabili, professionali, preparati, pazienti, amichevoli ed empatici. Grazie al loro incredibile servizio, siamo stati in grado di esplorare la splendida città di Doha, immergendoci nei vibranti profumi, suoni e colori del Qatar."
              </p>

              {/* Image */}
              <div className="mb-4">
                <img
                  src="https://escursionincrociera.com/wp-content/uploads/2024/05/3.webp"
                  alt="Alessio Ghibellino - Travel Agent"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Author Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Alessio Ghibellino</p>
                    <p className="text-sm text-gray-600">Travel Agent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

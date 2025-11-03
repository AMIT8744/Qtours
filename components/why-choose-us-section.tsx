"use client"

import Image from "next/image"

export function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            {/* Orange tag */}
            <div className="inline-block">
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wide">
                PERCHÉ SCEGLIERE NOI
              </span>
            </div>

            {/* Main heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Il nostro Team progetterà la soluzione adatta per te
            </h2>

            {/* Description text */}
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Il team dei I Viaggi del Qatar si impegna a offrire esperienze eccezionali ai propri clienti dal momento
                della prenotazione fino alla partenza. Siamo un team Italiano residenti da lungo termine in Qatar ed
                Emirati abbiamo guide anche in inglese, francese, spagnolo, tedesco, portoghese e arabo.
              </p>
              <p>
                Con oltre 15 anni di esperienza in loco e più di 30 nel settore del turismo, siamo in grado di gestire
                qualsiasi tipo di richiesta.
              </p>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <Image
                src="https://stories.forbestravelguide.com/wp-content/uploads/2024/02/HeroBestDohaHotels-RafflesDoha-ExteriorDay-CreditRafflesDoha.jpg"
                alt="Doha skyline at sunset"
                width={500}
                height={600}
                className="rounded-3xl shadow-2xl object-cover"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Instagram Section */}
        <div className="mt-20 text-center">
          <div className="space-y-8">
            {/* Instagram heading */}
            <div className="inline-block">
              <span className="bg-orange-100 text-orange-800 px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wide">
                SEGUICI SU INSTAGRAM
              </span>
            </div>

            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Scopri le nostre avventure quotidiane
            </h3>

            <p className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              Segui @viaggidelqatar per vedere le foto più belle dei nostri tour, consigli di viaggio e momenti speciali
              condivisi dai nostri clienti.
            </p>

            {/* Instagram Widget */}
            <div className="mt-12">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <iframe
                  src="https://widgets.sociablekit.com/instagram-feed/iframe/25575082"
                  frameBorder="0"
                  width="100%"
                  height="1000"
                  title="Instagram Feed"
                  style={{
                    overflow: "hidden",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  className="[&::-webkit-scrollbar]:hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection

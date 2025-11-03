"use client"

export function ThirdImageSection() {
  return (
    <section className="relative h-96 w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/third-section-image.png')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
         Escursioni in Italiano negli Emirati -Qatar-Oman  e Bahrain
          </h2>

          {/* Orange highlight box */}
          <div className="bg-orange-500 text-white px-6 py-3 rounded-lg mb-6 inline-block max-w-3xl">
            <span className="text-lg font-medium">
              Siamo specializzati nelle escursioni in Italiano per i Crocieristi su tutte le tappe di MSC e Costa
            </span>
          </div>

          <div className="space-y-4 text-lg leading-relaxed max-w-5xl mx-auto">
            <p>
              Le nostre escursioni vi permettono di visitare tutti i luoghi di interesse di ogni città della vostra
              crociera negli emirati. Coccolati dal nostro Staff Italiano, esplorerete tutto senza fretta, spendendo
              meno e tornando in perfetto orario per all aboard.
            </p>
            <p>
              Siamo gli unici a garantirVi sempre le Escursioni in Italiano su tutte le tappe di MSC e COSTA negli
              Emirati in Qatar, Oman e Bahrain. Offriamo anche pacchetti con stopover in queste città abbinati alle
              Maldive
            </p>
            <p>A breve offriremo escursioni anche in Arabia Saudita ed in Giordania per i Crocieristi.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

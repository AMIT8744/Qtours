"use client"

import { useTranslation } from "@/contexts/translation-context"

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
        <p className="text-lg text-gray-700">{t("hero.subtitle")}</p>
        {/* Add more content here, like a search bar or featured excursions */}
      </div>
    </section>
  )
}

export default Hero

"use client"

import { useState, useEffect } from "react"

export interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
]

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("selectedLanguage")
    if (savedLanguage && languages.find((lang) => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }

    // Listen for language change events
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language)
    }

    window.addEventListener("languageChanged", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange as EventListener)
    }
  }, [])

  const getLanguage = (code: string) => {
    return languages.find((lang) => lang.code === code)
  }

  const getCurrentLanguage = () => {
    return getLanguage(currentLanguage)
  }

  const setLanguage = (languageCode: string) => {
    if (languages.find((lang) => lang.code === languageCode)) {
      setCurrentLanguage(languageCode)
      localStorage.setItem("selectedLanguage", languageCode)
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: languageCode },
        }),
      )
    }
  }

  return {
    currentLanguage,
    getCurrentLanguage,
    setLanguage,
    languages,
    isEnglish: currentLanguage === "en",
    isItalian: currentLanguage === "it",
  }
}

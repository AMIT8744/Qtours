"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface TranslationContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, fallback?: string) => string
  isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations: Record<string, Record<string, string>> = {
  en: {
    "language.selectLanguage": "Select Language",
    "language.currentLanguage": "Current Language",
    "language.googleTranslate": "Google Translate",
    "language.loadingTranslate": "Loading Google Translate...",
    "navigation.dashboard": "Dashboard",
    "navigation.bookings": "Bookings",
    "navigation.tours": "Tours",
    "navigation.agents": "Agents",
    "navigation.ships": "Ships",
    "navigation.settings": "Settings",
    "navigation.profile": "Profile",
    "navigation.logout": "Logout",
    "navigation.addNewBooking": "Add New Booking",
    "navigation.receiptVerification": "Receipt Verification",
    "notifications.title": "Notifications",
    "notifications.noNotifications": "No notifications",
    "notifications.loadingNotifications": "Loading notifications...",
    "notifications.failedToLoad": "Failed to load notifications. Please try again later.",
    "notifications.retry": "Retry",
    "search.searchBookings": "Search bookings...",
    "common.search": "Search",
    "common.delete": "Delete",
    "user.agent": "Agent",
    "user.admin": "Admin",
  },
  it: {
    "language.selectLanguage": "Seleziona Lingua",
    "language.currentLanguage": "Lingua Attuale",
    "language.googleTranslate": "Google Translate",
    "language.loadingTranslate": "Caricamento Google Translate...",
    "navigation.dashboard": "Dashboard",
    "navigation.bookings": "Prenotazioni",
    "navigation.tours": "Tour",
    "navigation.agents": "Agenti",
    "navigation.ships": "Navi",
    "navigation.settings": "Impostazioni",
    "navigation.profile": "Profilo",
    "navigation.logout": "Disconnetti",
    "navigation.addNewBooking": "Aggiungi Nuova Prenotazione",
    "navigation.receiptVerification": "Verifica Ricevuta",
    "notifications.title": "Notifiche",
    "notifications.noNotifications": "Nessuna notifica",
    "notifications.loadingNotifications": "Caricamento notifiche...",
    "notifications.failedToLoad": "Impossibile caricare le notifiche. Riprova più tardi.",
    "notifications.retry": "Riprova",
    "search.searchBookings": "Cerca prenotazioni...",
    "common.search": "Cerca",
    "common.delete": "Elimina",
    "user.agent": "Agente",
    "user.admin": "Amministratore",
  },
  ar: {
    "language.selectLanguage": "اختر اللغة",
    "language.currentLanguage": "اللغة الحالية",
    "language.googleTranslate": "ترجمة جوجل",
    "language.loadingTranslate": "جاري تحميل ترجمة جوجل...",
    "navigation.dashboard": "لوحة التحكم",
    "navigation.bookings": "الحجوزات",
    "navigation.tours": "الجولات",
    "navigation.agents": "الوكلاء",
    "navigation.ships": "السفن",
    "navigation.settings": "الإعدادات",
    "navigation.profile": "الملف الشخصي",
    "navigation.logout": "تسجيل الخروج",
    "navigation.addNewBooking": "إضافة حجز جديد",
    "navigation.receiptVerification": "التحقق من الإيصال",
    "notifications.title": "الإشعارات",
    "notifications.noNotifications": "لا توجد إشعارات",
    "notifications.loadingNotifications": "جاري تحميل الإشعارات...",
    "notifications.failedToLoad": "فشل في تحميل الإشعارات. يرجى المحاولة مرة أخرى لاحقاً.",
    "notifications.retry": "إعادة المحاولة",
    "search.searchBookings": "البحث في الحجوزات...",
    "common.search": "بحث",
    "common.delete": "حذف",
    "user.agent": "وكيل",
    "user.admin": "مدير",
  },
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("it") // Default to Italian
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem("preferred-language", language)
  }, [language])

  const t = (key: string, fallback?: string): string => {
    const translation = translations[language]?.[key] || translations["en"]?.[key] || fallback || key
    return translation
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

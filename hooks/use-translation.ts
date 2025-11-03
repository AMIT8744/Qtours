"use client"

import { useState, useCallback } from "react"

interface TranslationState {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  isTranslating: boolean
}

export function useTranslation() {
  const [translations, setTranslations] = useState<Record<string, TranslationState>>({})

  const translateText = useCallback(
    async (text: string, sourceLanguage = "en", targetLanguage = "it", key?: string) => {
      const translationKey = key || `${sourceLanguage}-${targetLanguage}-${Date.now()}`

      setTranslations((prev) => ({
        ...prev,
        [translationKey]: {
          originalText: text,
          translatedText: "",
          sourceLanguage,
          targetLanguage,
          isTranslating: true,
        },
      }))

      try {
        // Using MyMemory Translation API (free tier)
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`,
        )

        const data = await response.json()

        if (data.responseData && data.responseData.translatedText) {
          setTranslations((prev) => ({
            ...prev,
            [translationKey]: {
              ...prev[translationKey],
              translatedText: data.responseData.translatedText,
              isTranslating: false,
            },
          }))

          return {
            success: true,
            translatedText: data.responseData.translatedText,
            key: translationKey,
          }
        } else {
          throw new Error("Translation failed")
        }
      } catch (error) {
        setTranslations((prev) => ({
          ...prev,
          [translationKey]: {
            ...prev[translationKey],
            isTranslating: false,
          },
        }))

        return {
          success: false,
          error: error instanceof Error ? error.message : "Translation failed",
          key: translationKey,
        }
      }
    },
    [],
  )

  const getTranslation = useCallback(
    (key: string) => {
      return translations[key]
    },
    [translations],
  )

  const clearTranslations = useCallback(() => {
    setTranslations({})
  }, [])

  return {
    translations,
    translateText,
    getTranslation,
    clearTranslations,
  }
}

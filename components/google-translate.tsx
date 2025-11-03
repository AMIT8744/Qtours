"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
  }
}

interface GoogleTranslateProps {
  pageLanguage?: string
  includedLanguages?: string
  layout?: number
  autoDisplay?: boolean
  multilanguagePage?: boolean
}

export default function GoogleTranslate({
  pageLanguage = "en",
  includedLanguages = "en,it,ar,fr,es,de",
  layout = 0,
  autoDisplay = false,
  multilanguagePage = false,
}: GoogleTranslateProps) {
  const googleTranslateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const addGoogleTranslateScript = () => {
      if (!window.google?.translate) {
        const script = document.createElement("script")
        script.type = "text/javascript"
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        script.async = true
        document.body.appendChild(script)

        window.googleTranslateElementInit = () => {
          if (googleTranslateRef.current && window.google?.translate) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: pageLanguage,
                includedLanguages: includedLanguages,
                layout: layout,
                autoDisplay: autoDisplay,
                multilanguagePage: multilanguagePage,
              },
              googleTranslateRef.current,
            )
          }
        }
      } else {
        // Google Translate is already loaded
        if (googleTranslateRef.current && window.google?.translate) {
          // Clear existing content
          googleTranslateRef.current.innerHTML = ""

          new window.google.translate.TranslateElement(
            {
              pageLanguage: pageLanguage,
              includedLanguages: includedLanguages,
              layout: layout,
              autoDisplay: autoDisplay,
              multilanguagePage: multilanguagePage,
            },
            googleTranslateRef.current,
          )
        }
      }
    }

    // Check if Google Translate API is available
    intervalId = setInterval(() => {
      if (window.google?.translate) {
        clearInterval(intervalId)
        addGoogleTranslateScript()
      }
    }, 100)

    // Initial attempt
    addGoogleTranslateScript()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [pageLanguage, includedLanguages, layout, autoDisplay, multilanguagePage])

  return (
    <div className="google-translate-container">
      <div ref={googleTranslateRef} id="google_translate_element" />
      <style jsx>{`
        .google-translate-container :global(.goog-te-banner-frame) {
          display: none !important;
        }
        .google-translate-container :global(.goog-te-menu-value) {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }
        .google-translate-container :global(.goog-te-menu-value:hover) {
          background: #f8fafc;
        }
        .google-translate-container :global(.goog-te-gadget) {
          font-family: inherit !important;
        }
        .google-translate-container :global(.goog-te-gadget-simple) {
          background-color: transparent !important;
          border: none !important;
          font-size: 14px !important;
        }
      `}</style>
    </div>
  )
}

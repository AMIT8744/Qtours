"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    // Add CSS to hide Google Translate elements
    const style = document.createElement("style")
    style.textContent = `
      .goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
      }
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
        visibility: hidden !important;
      }
      #goog-gt-tt {
        display: none !important;
        visibility: hidden !important;
      }
      .goog-te-banner-frame iframe {
        display: none !important;
        visibility: hidden !important;
      }
      body {
        top: 0 !important;
        position: static !important;
      }
      iframe#\\:1\\.container {
        display: none !important;
        visibility: hidden !important;
      }
      .skiptranslate {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `
    document.head.appendChild(style)

    // Initialize Google Translate
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,it",
            autoDisplay: false,
          },
          "google_translate_element",
        )
        setIsGoogleTranslateLoaded(true)
      }

      // Load Google Translate script
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.async = true
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      document.head.appendChild(script)
    }

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const triggerTranslation = (languageCode: string) => {
    const pollForSelect = () => {
      let attempts = 0
      const maxAttempts = 20 // 10 seconds max

      const interval = setInterval(() => {
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement
        attempts++

        if (select) {
          select.value = languageCode
          select.dispatchEvent(new Event("change"))
          setCurrentLanguage(languageCode)
          clearInterval(interval)

          // Close modal after successful translation
          setTimeout(() => {
            setIsOpen(false)
          }, 500)
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
          console.warn("Google Translate select element not found after maximum attempts")
        }
      }, 500)
    }

    pollForSelect()
  }

  const handleLanguageClick = (languageCode: string) => {
    if (!isGoogleTranslateLoaded) {
      console.warn("Google Translate not loaded yet")
      return
    }
    triggerTranslation(languageCode)
  }

  return (
    <>
      {/* Hidden Google Translate container */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Languages className="h-4 w-4" />
            Language
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            // Prevent modal from closing when clicking on Google Translate elements
            const target = e.target as Element
            if (target.closest(".goog-te-combo") || target.closest("#google_translate_element")) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Google Translate
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use Google Translate to translate the entire page content to your preferred language.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={currentLanguage === "en" ? "default" : "outline"}
                onClick={() => handleLanguageClick("en")}
                disabled={!isGoogleTranslateLoaded}
                className="flex items-center gap-2 h-12"
              >
                🇺🇸 English
              </Button>

              <Button
                variant={currentLanguage === "it" ? "default" : "outline"}
                onClick={() => handleLanguageClick("it")}
                disabled={!isGoogleTranslateLoaded}
                className="flex items-center gap-2 h-12"
              >
                🇮🇹 Italian
              </Button>
            </div>

            {!isGoogleTranslateLoaded && (
              <p className="text-xs text-muted-foreground text-center">Loading Google Translate...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LanguageSelector

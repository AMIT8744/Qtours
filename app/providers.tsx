import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { TranslationProvider } from "@/contexts/translation-context"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      {children}
      <Toaster />
    </TranslationProvider>
  )
}

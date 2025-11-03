import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import WhatsAppFloatingButton from "@/components/whatsapp-floating-button"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Viaggi Del Qatar - Escursioni per Crocieristi negli Emirati",
  description:
    "Escursioni specializzate in italiano per crocieristi su tutte le tappe di MSC e Costa negli Emirati, Qatar, Oman e Bahrain.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={poppins.className}>
        <Providers>
          {children}
          <WhatsAppFloatingButton hideOnDashboard={true} />
        </Providers>
      </body>
    </html>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-16 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Resta Aggiornato</h2>
            <p className="text-lg text-gray-600">
              Iscriviti alla nostra newsletter per ricevere offerte esclusive e aggiornamenti sui nostri tour negli
              Emirati
            </p>
          </div>

          {isSubscribed ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              Grazie per la tua iscrizione! Riceverai presto le nostre offerte esclusive.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2">
                Iscriviti
              </Button>
            </form>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Non invieremo spam. Puoi annullare l'iscrizione in qualsiasi momento.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Newsletter

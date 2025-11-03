"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  // General email form state
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    html: "<h1>Test Email</h1><p>This is a test email from Viaggi Del Qatar!</p>",
  })

  // Booking confirmation form state
  const [bookingForm, setBookingForm] = useState({
    customerName: "Mario Rossi",
    customerEmail: "",
    bookingReference: "VDQ-2024-001",
    tourName: "Tour del Deserto del Qatar",
    tourDate: "2024-01-15",
    totalAmount: 150,
    passengers: 2,
  })

  const sendTestEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.html) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailForm),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Successo!",
          description: "Email inviata con successo",
        })
      } else {
        toast({
          title: "Errore",
          description: result.error || "Errore nell'invio dell'email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore di connessione",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendBookingConfirmation = async () => {
    if (!bookingForm.customerEmail || !bookingForm.customerName) {
      toast({
        title: "Errore",
        description: "Nome cliente e email sono obbligatori",
        variant: "destructive",
      })
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch("/api/send-booking-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Successo!",
          description: "Email di conferma prenotazione inviata con successo",
        })
      } else {
        toast({
          title: "Errore",
          description: result.error || "Errore nell'invio dell'email di conferma",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore di connessione",
        variant: "destructive",
      })
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Test Email API</h1>
        <p className="text-muted-foreground">Testa le funzionalità di invio email</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Email Generale</TabsTrigger>
          <TabsTrigger value="booking">Conferma Prenotazione</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Invia Email Generale</CardTitle>
              <CardDescription>Testa l'API di invio email generale con contenuto personalizzato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="to">Destinatario</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="test@example.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subject">Oggetto</Label>
                <Input
                  id="subject"
                  placeholder="Oggetto dell'email"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="html">Contenuto HTML</Label>
                <Textarea
                  id="html"
                  placeholder="<h1>Ciao!</h1><p>Questo è il contenuto dell'email...</p>"
                  value={emailForm.html}
                  onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
                  rows={6}
                />
              </div>

              <Button onClick={sendTestEmail} disabled={loading} className="w-full">
                {loading ? "Invio in corso..." : "Invia Email di Test"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Conferma Prenotazione</CardTitle>
              <CardDescription>Testa l'email di conferma prenotazione con dati di esempio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nome Cliente</Label>
                  <Input
                    id="customerName"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Cliente</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="cliente@example.com"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingReference">Codice Prenotazione</Label>
                  <Input
                    id="bookingReference"
                    value={bookingForm.bookingReference}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingReference: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tourDate">Data Tour</Label>
                  <Input
                    id="tourDate"
                    type="date"
                    value={bookingForm.tourDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, tourDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tourName">Nome Tour</Label>
                <Input
                  id="tourName"
                  value={bookingForm.tourName}
                  onChange={(e) => setBookingForm({ ...bookingForm, tourName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passengers">Passeggeri</Label>
                  <Input
                    id="passengers"
                    type="number"
                    value={bookingForm.passengers}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, passengers: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Importo Totale (€)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={bookingForm.totalAmount}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, totalAmount: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <Button onClick={sendBookingConfirmation} disabled={bookingLoading} className="w-full">
                {bookingLoading ? "Invio in corso..." : "Invia Conferma Prenotazione"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

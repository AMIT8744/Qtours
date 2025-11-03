"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText, 
  Code, 
  ArrowLeft,
  Copy,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

interface EmailTemplate {
  name: string
  subject: string
  html: string
  text: string
  description: string
}

const emailTemplates: EmailTemplate[] = [
  {
    name: "Simple Test",
    subject: "Test Email from Viaggi Del Qatar",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b0f1a;">Test Email</h2>
        <p>This is a test email sent from the Viaggi Del Qatar booking system.</p>
        <p>If you received this email, the Resend API integration is working correctly!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sent via Resend API - Viaggi Del Qatar
        </p>
      </div>
    `,
    text: `Test Email from Viaggi Del Qatar

This is a test email sent from the Viaggi Del Qatar booking system.

If you received this email, the Resend API integration is working correctly!

---
Sent via Resend API - Viaggi Del Qatar`,
    description: "A simple test email to verify the Resend API integration"
  },
  {
    name: "Booking Confirmation",
    subject: "Booking Confirmation - VDQ-250802-7613",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6b0f1a; margin: 0;">Viaggi Del Qatar</h1>
          <p style="color: #666; margin: 5px 0;">Your booking has been confirmed!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #6b0f1a; margin-top: 0;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td>
              <td style="padding: 8px 0;">VDQ-250802-7613</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Tour:</td>
              <td style="padding: 8px 0;">Doha City Tour</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0;">August 2, 2025</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Passengers:</td>
              <td style="padding: 8px 0;">2 Adults</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #6b0f1a;">€50.00</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2d5a2d; margin-top: 0;">✅ Payment Confirmed</h3>
          <p style="margin: 0; color: #2d5a2d;">Your payment has been successfully processed.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #6b0f1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Booking Details
          </a>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
                   <p style="color: #666; font-size: 12px; text-align: center;">
             Thank you for choosing Viaggi Del Qatar!<br>
             📧 Booking: booking@qtours.tours | 📧 Support: palma@qtours.tours<br>
             📞 +97455472952 | 📍 Doha, Qatar
           </p>
      </div>
    `,
    text: `Viaggi Del Qatar - Booking Confirmation

Your booking has been confirmed!

BOOKING DETAILS:
Booking Reference: VDQ-250802-7613
Tour: Doha City Tour
Date: August 2, 2025
Passengers: 2 Adults
Total Amount: €50.00

✅ Payment Confirmed
Your payment has been successfully processed.

View your booking details at: https://viaggidelqatar.com/booking/VDQ-250802-7613

---
Thank you for choosing Viaggi Del Qatar!
📧 Booking: booking@qtours.tours | 📧 Support: palma@qtours.tours
📞 +97455472952 | 📍 Doha, Qatar`,
    description: "A booking confirmation email template"
  },
  {
    name: "Payment Receipt",
    subject: "Payment Receipt - VDQ-250802-7613",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6b0f1a; margin: 0;">Payment Receipt</h1>
          <p style="color: #666; margin: 5px 0;">Viaggi Del Qatar</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #6b0f1a; margin-top: 0;">Transaction Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Receipt Number:</td>
              <td style="padding: 8px 0;">VDQ-250802-7613</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0;">August 2, 2025</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
              <td style="padding: 8px 0;">Credit Card (Dibsy)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; color: #2d5a2d; font-weight: bold;">✅ Paid</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #6b0f1a; margin-top: 0;">Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; font-weight: bold;">Doha City Tour</td>
              <td style="padding: 12px 0; text-align: right;">€50.00</td>
            </tr>
            <tr style="border-top: 2px solid #6b0f1a;">
              <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #6b0f1a;">€50.00</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #6b0f1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download PDF Receipt
          </a>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
                 <p style="color: #666; font-size: 12px; text-align: center;">
           This is an official receipt from Viaggi Del Qatar<br>
           📧 Booking: booking@qtours.tours | 📧 Support: palma@qtours.tours<br>
           📞 +97455472952 | 📍 Doha, Qatar
         </p>
      </div>
    `,
    text: `Payment Receipt - Viaggi Del Qatar

TRANSACTION DETAILS:
Receipt Number: VDQ-250802-7613
Date: August 2, 2025
Payment Method: Credit Card (Dibsy)
Status: ✅ Paid

ITEMS:
Doha City Tour: €50.00

TOTAL: €50.00

Download your PDF receipt at: https://viaggidelqatar.com/booking/VDQ-250802-7613

---
This is an official receipt from Viaggi Del Qatar
📧 Booking: booking@qtours.tours | 📧 Support: palma@qtours.tours
📞 +97455472952 | 📍 Doha, Qatar`,
    description: "A payment receipt email template"
  },
  {
    name: "Agent Welcome",
    subject: "Benvenuto a Viaggi Del Qatar - Credenziali Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #6b0f1a, #8b1a2a); color: white; padding: 30px 20px; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Benvenuto a Viaggi Del Qatar!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Il suo account agente è stato creato con successo</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b0f1a;">
          <h3 style="margin-top: 0; color: #6b0f1a;">🔐 Credenziali di Accesso</h3>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Email:</span>
            <span style="color: #1e293b; font-family: monospace; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">agent@example.com</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: bold; color: #64748b;">Password:</span>
            <span style="color: #1e293b; font-family: monospace; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">TempPass123!</span>
          </div>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #d97706;">🔒 Sicurezza</h4>
          <p style="margin: 0;"><strong>Importante:</strong> Per motivi di sicurezza, le consigliamo di cambiare la password al primo accesso.</p>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #6b0f1a;">📞 Prossimi Passi</h4>
          <p>Ora può accedere al sistema e iniziare a gestire le prenotazioni dei clienti.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #6b0f1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Accedi al Sistema
          </a>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #6b0f1a;">📞 Supporto Tecnico</h4>
                     <p><strong>📧 Booking:</strong> booking@qtours.tours</p>
           <p><strong>📧 Supporto:</strong> palma@qtours.tours</p>
           <p><strong>📞 Telefono:</strong> +97455472952</p>
           <p><strong>📍 Sede:</strong> Doha, Qatar</p>
        </div>
        
        <div style="text-align: center; padding: 30px 20px; background: #f8fafc; color: #64748b; border-radius: 8px;">
          <p><strong>Le auguriamo grande successo nel suo nuovo ruolo!</strong></p>
          <p style="margin-top: 20px;"><strong>Cordiali saluti,</strong><br>
          <strong>Team Amministrativo - Viaggi Del Qatar</strong></p>
        </div>
      </div>
    `,
    text: `Viaggi Del Qatar - Benvenuto Agente

Gentile Agente,

🎉 Benvenuto a Viaggi Del Qatar!

Siamo entusiasti di darle il benvenuto nel nostro team! Il suo account agente è stato creato con successo.

🔐 CREDENZIALI DI ACCESSO:
Email: agent@example.com
Password: TempPass123!

🔒 SICUREZZA:
IMPORTANTE: Per motivi di sicurezza, le consigliamo di cambiare la password al primo accesso.

📞 PROSSIMI PASSI:
Ora può accedere al sistema e iniziare a gestire le prenotazioni dei clienti.

📞 SUPPORTO TECNICO:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

---
Le auguriamo grande successo nel suo nuovo ruolo!

Cordiali saluti,
Team Amministrativo - Viaggi Del Qatar`,
    description: "An agent welcome email template with credentials"
  },
  {
    name: "Booking Notification",
    subject: "Nuova Prenotazione - VDQ-250802-7613",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #6b0f1a, #8b1a2a); color: white; padding: 30px 20px; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 28px;">🔔 Nuova Prenotazione!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Una nuova prenotazione è stata creata nel sistema</p>
        </div>
        
        <div style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold;">
          📋 Prenotazione VDQ-250802-7613
        </div>
        
        <p>È stata ricevuta una nuova prenotazione nel sistema. Di seguito i dettagli:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b0f1a;">
          <h3 style="margin-top: 0; color: #6b0f1a;">📋 Dettagli Prenotazione</h3>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Codice Prenotazione:</span>
            <span style="color: #1e293b;"><strong>VDQ-250802-7613</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Cliente:</span>
            <span style="color: #1e293b;">John Doe</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Email Cliente:</span>
            <span style="color: #1e293b;">john.doe@example.com</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Tour:</span>
            <span style="color: #1e293b;">Doha City Tour</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Data:</span>
            <span style="color: #1e293b;">venerdì, 2 agosto 2025</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Numero Passeggeri:</span>
            <span style="color: #1e293b;">2 persone</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; color: #64748b;">Importo Totale:</span>
            <span style="color: #1e293b;"><strong>€50.00</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: bold; color: #64748b;">Stato:</span>
            <span style="color: #6b0f1a;"><strong>PENDING</strong></span>
          </div>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #6b0f1a;">📞 Azioni Richieste</h4>
          <p>Si prega di verificare i dettagli della prenotazione e procedere con la gestione secondo le procedure aziendali.</p>
          <p>Se necessario, contattare il cliente per ulteriori informazioni o conferme.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #6b0f1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Visualizza Prenotazioni</a>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #6b0f1a;">📞 Informazioni di Contatto</h4>
          <p style="margin: 5px 0;"><strong>📧 Booking:</strong> booking@qtours.tours</p>
          <p style="margin: 5px 0;"><strong>📧 Supporto:</strong> palma@qtours.tours</p>
          <p style="margin: 5px 0;"><strong>📞 Telefono:</strong> +97455472952</p>
          <p style="margin: 5px 0;"><strong>📍 Sede:</strong> Doha, Qatar</p>
        </div>
        
        <div style="text-align: center; padding: 30px 20px; background: #f8fafc; color: #64748b;">
          <p style="margin: 0;"><strong>Cordiali saluti,</strong><br>
          <strong>Sistema di Notifiche - Viaggi Del Qatar</strong></p>
          <p style="margin-top: 20px;"><small>Questa è un'email automatica. Si prega di non rispondere a questo messaggio.</small></p>
        </div>
      </div>
    `,
    text: `Viaggi Del Qatar - Nuova Prenotazione

🔔 NUOVA PRENOTAZIONE!

È stata ricevuta una nuova prenotazione nel sistema.

DETTAGLI PRENOTAZIONE:
Codice Prenotazione: VDQ-250802-7613
Cliente: John Doe
Email Cliente: john.doe@example.com
Tour: Doha City Tour
Data: venerdì, 2 agosto 2025
Numero Passeggeri: 2 persone
Importo Totale: €50.00
Stato: PENDING

📞 AZIONI RICHIESTE:
Si prega di verificare i dettagli della prenotazione e procedere con la gestione secondo le procedure aziendali.

Visualizza prenotazioni: http://localhost:3000/dashboard/bookings

📞 INFORMAZIONI DI CONTATTO:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

---
Cordiali saluti,
Sistema di Notifiche - Viaggi Del Qatar

Questa è un'email automatica. Si prega di non rispondere a questo messaggio.`,
    description: "A booking notification email template for admin notifications"
  }
]

export default function TestEmailResendClient() {
  const [emailData, setEmailData] = useState({
    to: "",
    from: "noreply@qtours.dakaeitechnologies.com",
    subject: "",
    html: "",
    text: ""
  })
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("compose")

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  const handleTemplateSelect = (template: EmailTemplate) => {
    setEmailData({
      to: emailData.to,
      from: emailData.from,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text)) {
      setResult({
        success: false,
        error: "Please fill in all required fields: to, subject, and either html or text content"
      })
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/send-email-resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Clear form on success
        setEmailData({
          to: "",
          from: "noreply@qtours.dakaeitechnologies.com",
          subject: "",
          html: "",
          text: ""
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to send email. Please try again."
      })
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Mail className="h-3 w-3 mr-1" />
              Resend Email Test
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resend Email Test</h1>
          <p className="text-gray-600">Test the Resend API email functionality</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Compose Test Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="to">To Email *</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailData.to}
                      onChange={(e) => handleInputChange("to", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="from">From Email</Label>
                    <Input
                      id="from"
                      type="email"
                      placeholder="noreply@viaggidelqatar.com"
                      value={emailData.from}
                      onChange={(e) => handleInputChange("from", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Test Email Subject"
                    value={emailData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="html">HTML Content</Label>
                    <Textarea
                      id="html"
                      placeholder="<h1>Hello World</h1>"
                      rows={10}
                      value={emailData.html}
                      onChange={(e) => handleInputChange("html", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="text">Plain Text Content</Label>
                    <Textarea
                      id="text"
                      placeholder="Hello World"
                      rows={10}
                      value={emailData.text}
                      onChange={(e) => handleInputChange("text", e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSendEmail} 
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Email Templates
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Select a template to pre-fill the email form
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {emailTemplates.map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subject:</span>
                            <span className="font-mono">{template.subject}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleTemplateSelect(template)}
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                          {result.success ? "Email sent successfully!" : result.error}
                        </AlertDescription>
                      </div>
                    </Alert>

                    {result.success && result.emailId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Email Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email ID:</span>
                            <span className="font-mono">{result.emailId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Sent
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">API Response</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No test results yet. Send an email to see the results here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
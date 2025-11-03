interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}

interface SendEmailResult {
  success: boolean
  message?: string
  emailId?: string
  error?: string
}

/**
 * Send an email using the Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = "noreply@qtours.dakaeitechnologies.com"
}: SendEmailParams): Promise<SendEmailResult> {
  console.log("📧 sendEmail called with:", { to, subject, from })
  
  try {
    const emailData = {
      to,
      subject,
      html,
      text,
      from
    }
    
    // Use absolute URL for server-side requests
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const apiUrl = `${baseUrl}/api/send-email-resend`
    
    console.log("📧 Environment check:")
    console.log("📧 NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)
    console.log("📧 Base URL:", baseUrl)
    console.log("📧 Full API URL:", apiUrl)
    console.log("📧 Request data:", emailData)
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    console.log("📧 Response status:", response.status)
    console.log("📧 Response ok:", response.ok)
    console.log("📧 Response headers:", Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      console.error("📧 HTTP Error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("📧 Error response body:", errorText)
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
    
    const result = await response.json()
    console.log("📧 Response JSON:", result)

    if (result.success) {
      console.log("📧 Email sent successfully!")
      return {
        success: true,
        message: result.message,
        emailId: result.emailId
      }
    } else {
      console.log("📧 Email failed to send")
      return {
        success: false,
        error: result.error || "Failed to send email"
      }
    }
  } catch (error) {
    console.error("📧 Error in sendEmail:", error)
    console.error("📧 Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    }
  }
}

/**
 * Send a simple text email
 */
export async function sendTextEmail(
  to: string,
  subject: string,
  body: string,
  from?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    text: body,
    from
  })
}

/**
 * Send an HTML email
 */
export async function sendHtmlEmail(
  to: string,
  subject: string,
  htmlBody: string,
  from?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html: htmlBody,
    from
  })
}

/**
 * Send a booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  to: string,
  bookingData: {
    reference: string
    customerName: string
    tourName: string
    tourDate: string
    totalAmount: number
    passengers: number
  }
): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conferma Prenotazione - ${bookingData.reference}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .banner-header {
            width: 100%;
            height: auto;
            max-height: 200px;
            object-fit: cover;
            display: block;
          }
          .content { padding: 30px 20px; }
          .success-badge {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .booking-details { 
            background: #f8fafc; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #6b0f1a;
          }
          .booking-details h3 { 
            margin-top: 0; 
            color: #6b0f1a; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #64748b; }
          .detail-value { color: #1e293b; }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            background: #f8fafc; 
            color: #64748b; 
          }
          .contact-info {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .contact-info h4 {
            margin-top: 0;
            color: #6b0f1a;
          }
          .cta-button {
            background: #6b0f1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          /* Mobile responsive styles */
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              box-shadow: none;
            }
            .content {
              padding: 20px 15px;
            }
            .booking-details {
              padding: 15px;
              margin: 15px 0;
            }
            .detail-row {
              flex-direction: column;
              gap: 5px;
            }
            .detail-label {
              margin-bottom: 5px;
            }
            .contact-info {
              padding: 15px;
              margin: 15px 0;
            }
            .banner-header {
              max-height: 150px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://i.ibb.co/BKsJ6hMz/qtours.png" alt="Viaggi Del Qatar - Booking Confirmation" class="banner-header">
          <div class="content">
            <h1>✅ Pagamento Confermato!</h1>
            <p>Grazie per aver scelto Viaggi Del Qatar!</p>
          
          <div class="content">
            <h2>Gentile ${bookingData.customerName},</h2>
            
            <div class="success-badge">
              🎉 Il suo pagamento è stato elaborato con successo!
            </div>
            
            <p>Siamo lieti di confermare che il suo pagamento è stato ricevuto e la sua prenotazione è ora completamente confermata.</p>
            
            <div class="booking-details">
              <h3>📋 Dettagli Prenotazione</h3>
              <div class="detail-row">
                <span class="detail-label">Codice Prenotazione:</span>
                <span class="detail-value"><strong>${bookingData.reference}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tour:</span>
                <span class="detail-value">${bookingData.tourName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data:</span>
                <span class="detail-value">${bookingData.tourDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Numero Passeggeri:</span>
                <span class="detail-value">${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Importo Totale:</span>
                <span class="detail-value"><strong>€${bookingData.totalAmount}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Stato Pagamento:</span>
                <span class="detail-value" style="color: #10b981;"><strong>✅ PAGATO</strong></span>
              </div>
            </div>

            <div class="contact-info">
              <h4>📞 Prossimi Passi</h4>
              <p>La sua prenotazione è ora confermata! Riceverà ulteriori dettagli sul punto di incontro e l'orario di partenza via email o SMS prima della data del tour.</p>
              <p>Se ha domande o necessita di assistenza, non esiti a contattarci.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingData.reference}" class="cta-button">
                Visualizza Dettagli Prenotazione
              </a>
            </div>

                         <div class="contact-info">
               <h4>📞 Informazioni di Contatto</h4>
               <p><strong>📧 Booking:</strong> booking@qtours.tours</p>
               <p><strong>📧 Supporto:</strong> palma@qtours.tours</p>
               <p><strong>📞 Telefono:</strong> +97455472952</p>
               <p><strong>📍 Sede:</strong> Doha, Qatar</p>
             </div>
           </div>
           
           <div class="footer">
             <p><strong>Cordiali saluti,</strong><br>
             <strong>Team Viaggi Del Qatar</strong></p>
             <p style="margin-top: 20px;"><small>Questa è un'email automatica. Si prega di non rispondere a questo messaggio.</small></p>
             <p><small>Per assistenza, contattaci direttamente ai recapiti sopra indicati.</small></p>
           </div>
        </div>
      </body>
    </html>
  `

  const text = `Viaggi Del Qatar - Conferma Prenotazione

Gentile ${bookingData.customerName},

✅ Pagamento Confermato!

Il suo pagamento è stato elaborato con successo e la sua prenotazione è ora completamente confermata.

DETTAGLI PRENOTAZIONE:
Codice Prenotazione: ${bookingData.reference}
Tour: ${bookingData.tourName}
Data: ${bookingData.tourDate}
Numero Passeggeri: ${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}
Importo Totale: €${bookingData.totalAmount}
Stato Pagamento: ✅ PAGATO

📞 Prossimi Passi:
La sua prenotazione è ora confermata! Riceverà ulteriori dettagli sul punto di incontro e l'orario di partenza via email o SMS prima della data del tour.

Visualizza i dettagli della prenotazione: ${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingData.reference}

📞 Informazioni di Contatto:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

---
Cordiali saluti,
Team Viaggi Del Qatar

Questa è un'email automatica. Per assistenza, contattaci direttamente ai recapiti sopra indicati.`

  return sendEmail({
    to,
    subject: `Conferma Prenotazione - ${bookingData.reference}`,
    html,
    text
  })
}

/**
 * Send an agent welcome email with account credentials
 */
export async function sendAgentWelcomeEmail(
  to: string,
  agentData: {
    name: string
    email: string
    password: string
  }
): Promise<SendEmailResult> {
  console.log("📧 sendAgentWelcomeEmail called with:", { to, agentData })
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Benvenuto a Viaggi Del Qatar</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #6b0f1a 0%, #8b1a2a 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content { padding: 30px 20px; }
          .welcome-badge {
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .credentials-box { 
            background: #f8fafc; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #6b0f1a;
          }
          .credentials-box h3 { 
            margin-top: 0; 
            color: #6b0f1a; 
          }
          .credential-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0;
          }
          .credential-row:last-child { border-bottom: none; }
          .credential-label { font-weight: bold; color: #64748b; }
          .credential-value { 
            color: #1e293b; 
            font-family: monospace;
            background: #e2e8f0;
            padding: 2px 8px;
            border-radius: 4px;
          }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            background: #f8fafc; 
            color: #64748b; 
          }
          .contact-info {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .contact-info h4 {
            margin-top: 0;
            color: #6b0f1a;
          }
          .cta-button {
            background: #6b0f1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .security-note h4 {
            margin-top: 0;
            color: #d97706;
          }
          /* Mobile responsive styles */
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              box-shadow: none;
            }
            .content {
              padding: 20px 15px;
            }
            .credentials-box {
              padding: 15px;
              margin: 15px 0;
            }
            .credential-row {
              flex-direction: column;
              gap: 5px;
            }
            .credential-label {
              margin-bottom: 5px;
            }
            .contact-info {
              padding: 15px;
              margin: 15px 0;
            }
            .banner-header {
              max-height: 150px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://i.ibb.co/BKsJ6hMz/qtours.png" alt="Viaggi Del Qatar - Welcome" class="banner-header">
          <div class="content">
            <h1>🎉 Benvenuto a Viaggi Del Qatar!</h1>
            <p>Il suo account agente è stato creato con successo</p>
          
          <div class="content">
            <h2>Gentile ${agentData.name},</h2>
            
            <div class="welcome-badge">
              🎯 Benvenuto nel nostro team!
            </div>
            
            <p>Siamo entusiasti di darle il benvenuto nel team di <strong>Viaggi Del Qatar</strong>! Il suo account agente è stato creato con successo e ora può accedere al nostro sistema di gestione prenotazioni.</p>
            
            <div class="credentials-box">
              <h3>🔐 Credenziali di Accesso</h3>
              <div class="credential-row">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${agentData.email}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${agentData.password}</span>
              </div>
            </div>

            <div class="security-note">
              <h4>🔒 Sicurezza</h4>
              <p><strong>Importante:</strong> Per motivi di sicurezza, le consigliamo di cambiare la password al primo accesso. La password temporanea fornita dovrebbe essere modificata immediatamente.</p>
            </div>

            <div class="contact-info">
              <h4>📞 Prossimi Passi</h4>
              <p>Ora può accedere al sistema e iniziare a gestire le prenotazioni dei clienti. Se ha domande o necessita di assistenza, non esiti a contattare l'amministratore del sistema.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" class="cta-button">
                Accedi al Sistema
              </a>
            </div>

                         <div class="contact-info">
               <h4>📞 Supporto Tecnico</h4>
               <p><strong>📧 Booking:</strong> booking@qtours.tours</p>
               <p><strong>📧 Supporto:</strong> palma@qtours.tours</p>
               <p><strong>📞 Telefono:</strong> +97455472952</p>
               <p><strong>📍 Sede:</strong> Doha, Qatar</p>
             </div>
          </div>
          
          <div class="footer">
            <p><strong>Le auguriamo grande successo nel suo nuovo ruolo!</strong></p>
            <p style="margin-top: 20px;"><strong>Cordiali saluti,</strong><br>
            <strong>Team Amministrativo - Viaggi Del Qatar</strong></p>
            <p style="margin-top: 20px;"><small>Questa è un'email automatica. Si prega di non rispondere a questo messaggio.</small></p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Viaggi Del Qatar - Benvenuto Agente

Gentile ${agentData.name},

🎉 Benvenuto a Viaggi Del Qatar!

Siamo entusiasti di darle il benvenuto nel nostro team! Il suo account agente è stato creato con successo e ora può accedere al nostro sistema di gestione prenotazioni.

🔐 CREDENZIALI DI ACCESSO:
Email: ${agentData.email}
Password: ${agentData.password}

🔒 SICUREZZA:
IMPORTANTE: Per motivi di sicurezza, le consigliamo di cambiare la password al primo accesso. La password temporanea fornita dovrebbe essere modificata immediatamente.

📞 PROSSIMI PASSI:
Ora può accedere al sistema e iniziare a gestire le prenotazioni dei clienti. Se ha domande o necessita di assistenza, non esiti a contattare l'amministratore del sistema.

Accedi al sistema: ${process.env.NEXT_PUBLIC_APP_URL}/admin/login

📞 SUPPORTO TECNICO:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

---
Le auguriamo grande successo nel suo nuovo ruolo!

Cordiali saluti,
Team Amministrativo - Viaggi Del Qatar

Questa è un'email automatica. Si prega di non rispondere a questo messaggio.`

  console.log("📧 About to call sendEmail with subject: Benvenuto a Viaggi Del Qatar - Credenziali Account")
  
  const result = await sendEmail({
    to,
    subject: `Benvenuto a Viaggi Del Qatar - Credenziali Account`,
    html,
    text
  })
  
  console.log("📧 sendEmail result:", result)
  return result
}

/**
 * Send a booking notification email to admin/notification email
 */
export async function sendBookingNotificationEmail(
  to: string,
  bookingData: {
    reference: string
    customerName: string
    customerEmail: string
    tourName: string
    tourDate: string
    totalAmount: number
    passengers: number
    status: string
  }
): Promise<SendEmailResult> {
  console.log("📧 sendBookingNotificationEmail called with:", { to, bookingData })
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nuova Prenotazione - ${bookingData.reference}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #6b0f1a, #8b1a2a); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .notification-badge {
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .booking-details { 
            background: #f8fafc; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #6b0f1a;
          }
          .booking-details h3 { 
            margin-top: 0; 
            color: #6b0f1a; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #64748b; }
          .detail-value { color: #1e293b; }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            background: #f8fafc; 
            color: #64748b; 
          }
          .contact-info {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .contact-info h4 {
            margin-top: 0;
            color: #6b0f1a;
          }
          .cta-button {
            background: #6b0f1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nuova Prenotazione!</h1>
            <p>Una nuova prenotazione è stata creata nel sistema</p>
          </div>
          
          <div class="content">
            <div class="notification-badge">
              📋 Prenotazione ${bookingData.reference}
            </div>
            
            <p>È stata ricevuta una nuova prenotazione nel sistema. Di seguito i dettagli:</p>
            
            <div class="booking-details">
              <h3>📋 Dettagli Prenotazione</h3>
              <div class="detail-row">
                <span class="detail-label">Codice Prenotazione:</span>
                <span class="detail-value"><strong>${bookingData.reference}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cliente:</span>
                <span class="detail-value">${bookingData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email Cliente:</span>
                <span class="detail-value">${bookingData.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tour:</span>
                <span class="detail-value">${bookingData.tourName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data:</span>
                <span class="detail-value">${bookingData.tourDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Numero Passeggeri:</span>
                <span class="detail-value">${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Importo Totale:</span>
                <span class="detail-value"><strong>€${bookingData.totalAmount}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Stato:</span>
                <span class="detail-value" style="color: #6b0f1a;"><strong>${bookingData.status.toUpperCase()}</strong></span>
              </div>
            </div>

            <div class="contact-info">
              <h4>📞 Azioni Richieste</h4>
              <p>Si prega di verificare i dettagli della prenotazione e procedere con la gestione secondo le procedure aziendali.</p>
              <p>Se necessario, contattare il cliente per ulteriori informazioni o conferme.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings" class="cta-button">
                Visualizza Prenotazioni
              </a>
            </div>

            <div class="contact-info">
              <h4>📞 Informazioni di Contatto</h4>
              <p><strong>📧 Booking:</strong> booking@qtours.tours</p>
              <p><strong>📧 Supporto:</strong> palma@qtours.tours</p>
              <p><strong>📞 Telefono:</strong> +97455472952</p>
              <p><strong>📍 Sede:</strong> Doha, Qatar</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Cordiali saluti,</strong><br>
            <strong>Sistema di Notifiche - Viaggi Del Qatar</strong></p>
            <p style="margin-top: 20px;"><small>Questa è un'email automatica. Si prega di non rispondere a questo messaggio.</small></p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `Viaggi Del Qatar - Nuova Prenotazione

🔔 NUOVA PRENOTAZIONE!

È stata ricevuta una nuova prenotazione nel sistema.

DETTAGLI PRENOTAZIONE:
Codice Prenotazione: ${bookingData.reference}
Cliente: ${bookingData.customerName}
Email Cliente: ${bookingData.customerEmail}
Tour: ${bookingData.tourName}
Data: ${bookingData.tourDate}
Numero Passeggeri: ${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}
Importo Totale: €${bookingData.totalAmount}
Stato: ${bookingData.status.toUpperCase()}

📞 AZIONI RICHIESTE:
Si prega di verificare i dettagli della prenotazione e procedere con la gestione secondo le procedure aziendali.

Visualizza prenotazioni: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings

📞 INFORMAZIONI DI CONTATTO:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

---
Cordiali saluti,
Sistema di Notifiche - Viaggi Del Qatar

Questa è un'email automatica. Si prega di non rispondere a questo messaggio.`

  console.log("📧 About to call sendEmail with subject: Nuova Prenotazione - " + bookingData.reference)
  
  const result = await sendEmail({
    to,
    subject: `Nuova Prenotazione - ${bookingData.reference}`,
    html,
    text
  })
  
  console.log("📧 sendEmail result:", result)
  return result
} 

/**
 * Send booking information email to client (manual sending from dashboard)
 */
export async function sendBookingInformationEmail(
  to: string,
  bookingData: {
    reference: string
    customerName: string
    customerEmail: string
    tourName: string
    tourDate: string
    totalAmount: number
    passengers: number
    status: string
    tourDetails?: Array<{
      tourName: string
      tourDate: string
      adults: number
      children: number
      totalPax: number
      price: number
      shipName?: string
      tourGuide?: string
    }>
  }
): Promise<SendEmailResult> {
  console.log("📧 sendBookingInformationEmail called with:", { to, bookingData })

  const html = `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informazioni Prenotazione - Viaggi Del Qatar</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #6b0f1a, #8b1a2a);
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .booking-ref {
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .booking-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #6b0f1a;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #64748b;
          }
          .detail-value {
            color: #1e293b;
          }
          .tour-details {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .tour-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
            border: 1px solid #e2e8f0;
          }
          .tour-header {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .tour-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 14px;
          }
          .contact-info {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .contact-info h4 {
            margin-top: 0;
            color: #6b0f1a;
          }
          .cta-button {
            background: #6b0f1a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            padding: 30px 20px;
            background: #f8fafc;
            color: #64748b;
            margin-top: 30px;
            border-radius: 8px;
          }
          .status-badge {
            background: #6b0f1a;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Informazioni Prenotazione</h1>
          <p>Dettagli completi della tua prenotazione</p>
        </div>
        
        <div class="booking-ref">
          📋 Prenotazione ${bookingData.reference}
        </div>
        
        <p>Gentile ${bookingData.customerName},</p>
        
        <p>Di seguito trovi i dettagli completi della tua prenotazione:</p>
        
        <div class="booking-details">
          <h3 style="margin-top: 0; color: #6b0f1a;">📋 Dettagli Generali</h3>
          <div class="detail-row">
            <span class="detail-label">Codice Prenotazione:</span>
            <span class="detail-value"><strong>${bookingData.reference}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cliente:</span>
            <span class="detail-value">${bookingData.customerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${bookingData.customerEmail}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Numero Passeggeri:</span>
            <span class="detail-value">${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Importo Totale:</span>
            <span class="detail-value"><strong>€${bookingData.totalAmount}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Stato:</span>
            <span class="detail-value"><span class="status-badge">${bookingData.status.toUpperCase()}</span></span>
          </div>
        </div>

        ${bookingData.tourDetails && bookingData.tourDetails.length > 0 ? `
        <div class="tour-details">
          <h3 style="margin-top: 0; color: #3b82f6;">🚢 Dettagli Tour</h3>
          ${bookingData.tourDetails.map((tour, index) => `
            <div class="tour-item">
              <div class="tour-header">Tour ${index + 1}: ${tour.tourName}</div>
              <div class="tour-row">
                <span>Data:</span>
                <span><strong>${tour.tourDate}</strong></span>
              </div>
              ${tour.shipName ? `
              <div class="tour-row">
                <span>Nave:</span>
                <span>${tour.shipName}</span>
              </div>
              ` : ''}
              <div class="tour-row">
                <span>Adulti:</span>
                <span>${tour.adults}</span>
              </div>
              <div class="tour-row">
                <span>Bambini:</span>
                <span>${tour.children}</span>
              </div>
              <div class="tour-row">
                <span>Totale Passeggeri:</span>
                <span><strong>${tour.totalPax}</strong></span>
              </div>
              <div class="tour-row">
                <span>Prezzo:</span>
                <span><strong>€${tour.price}</strong></span>
              </div>
              ${tour.tourGuide ? `
              <div class="tour-row">
                <span>Guida:</span>
                <span>${tour.tourGuide}</span>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : `
        <div class="tour-details">
          <h3 style="margin-top: 0; color: #3b82f6;">🚢 Dettagli Tour</h3>
          <div class="tour-item">
            <div class="tour-header">${bookingData.tourName}</div>
            <div class="tour-row">
              <span>Data:</span>
              <span><strong>${bookingData.tourDate}</strong></span>
            </div>
          </div>
        </div>
        `}

        <div class="contact-info">
          <h4>📞 Informazioni di Contatto</h4>
          <p style="margin: 5px 0;"><strong>📧 Booking:</strong> booking@qtours.tours</p>
          <p style="margin: 5px 0;"><strong>📧 Supporto:</strong> palma@qtours.tours</p>
          <p style="margin: 5px 0;"><strong>📞 Telefono:</strong> +97455472952</p>
          <p style="margin: 5px 0;"><strong>📍 Sede:</strong> Doha, Qatar</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingData.reference}" class="cta-button">
            Visualizza Prenotazione
          </a>
        </div>
        
        <div class="footer">
          <p style="margin: 0;"><strong>Cordiali saluti,</strong><br>
          <strong>Viaggi Del Qatar</strong></p>
          <p style="margin-top: 20px;"><small>Questa è un'email informativa. Per assistenza, contattaci ai numeri indicati sopra.</small></p>
        </div>
      </body>
    </html>
  `

  const text = `Viaggi Del Qatar - Informazioni Prenotazione

📋 INFORMAZIONI PRENOTAZIONE

Gentile ${bookingData.customerName},

Di seguito trovi i dettagli completi della tua prenotazione:

DETTAGLI GENERALI:
Codice Prenotazione: ${bookingData.reference}
Cliente: ${bookingData.customerName}
Email: ${bookingData.customerEmail}
Numero Passeggeri: ${bookingData.passengers} ${bookingData.passengers === 1 ? "persona" : "persone"}
Importo Totale: €${bookingData.totalAmount}
Stato: ${bookingData.status.toUpperCase()}

${bookingData.tourDetails && bookingData.tourDetails.length > 0 ? `
DETTAGLI TOUR:
${bookingData.tourDetails.map((tour, index) => `
Tour ${index + 1}: ${tour.tourName}
Data: ${tour.tourDate}
${tour.shipName ? `Nave: ${tour.shipName}` : ''}
Adulti: ${tour.adults}
Bambini: ${tour.children}
Totale Passeggeri: ${tour.totalPax}
Prezzo: €${tour.price}
${tour.tourGuide ? `Guida: ${tour.tourGuide}` : ''}
`).join('\n')}
` : `
DETTAGLI TOUR:
${bookingData.tourName}
Data: ${bookingData.tourDate}
`}

📞 INFORMAZIONI DI CONTATTO:
📧 Booking: booking@qtours.tours
📧 Supporto: palma@qtours.tours
📞 Telefono: +97455472952
📍 Sede: Doha, Qatar

Visualizza prenotazione: ${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingData.reference}

---
Cordiali saluti,
Viaggi Del Qatar

Questa è un'email informativa. Per assistenza, contattaci ai numeri indicati sopra.`

  console.log("📧 About to call sendEmail with subject: Informazioni Prenotazione - " + bookingData.reference)
  
  const result = await sendEmail({
    to,
    subject: `Informazioni Prenotazione - ${bookingData.reference}`,
    html,
    text
  })
  
  console.log("📧 sendEmail result:", result)
  return result
} 
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_xxxxxxxxx"

interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  bookingReference: string
  tourName: string
  tourDate: string
  totalAmount: number
  passengers: number
  isPaymentConfirmation?: boolean
}

export async function POST(request: Request) {
  try {
    const bookingData: BookingConfirmationData = await request.json()

    const {
      customerName,
      customerEmail,
      bookingReference,
      tourName,
      tourDate,
      totalAmount,
      passengers,
      isPaymentConfirmation = true,
    } = bookingData

    if (!customerEmail || !customerName || !bookingReference) {
      return Response.json({ error: "Missing required booking data" }, { status: 400 })
    }

    const emailSubject = isPaymentConfirmation
      ? `Pagamento Confermato - ${bookingReference}`
      : `Conferma Prenotazione - ${bookingReference}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${isPaymentConfirmation ? "Pagamento Confermato" : "Conferma Prenotazione"}</title>
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
              <h1>${isPaymentConfirmation ? "✅ Pagamento Confermato!" : "📋 Conferma Prenotazione"}</h1>
              <p>Grazie per aver scelto Viaggi Del Qatar!</p>
            
            <div class="content">
              <h2>Gentile ${customerName},</h2>
              
              ${
                isPaymentConfirmation
                  ? `
                <div class="success-badge">
                  🎉 Il suo pagamento è stato elaborato con successo!
                </div>
                <p>Siamo lieti di confermare che il suo pagamento è stato ricevuto e la sua prenotazione è ora completamente confermata.</p>
              `
                  : `
                <p>La sua prenotazione è stata confermata! Ecco i dettagli della sua prenotazione:</p>
              `
              }
              
              <div class="booking-details">
                <h3>📋 Dettagli Prenotazione</h3>
                <div class="detail-row">
                  <span class="detail-label">Codice Prenotazione:</span>
                  <span class="detail-value"><strong>${bookingReference}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tour:</span>
                  <span class="detail-value">${tourName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Data:</span>
                  <span class="detail-value">${tourDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Numero Passeggeri:</span>
                  <span class="detail-value">${passengers} ${passengers === 1 ? "persona" : "persone"}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Importo Totale:</span>
                  <span class="detail-value"><strong>€${totalAmount}</strong></span>
                </div>
                ${
                  isPaymentConfirmation
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Stato Pagamento:</span>
                  <span class="detail-value" style="color: #10b981;"><strong>✅ PAGATO</strong></span>
                </div>
                `
                    : ""
                }
              </div>

              ${
                isPaymentConfirmation
                  ? `
                <div class="contact-info">
                  <h4>📞 Prossimi Passi</h4>
                  <p>La sua prenotazione è ora confermata! Riceverà ulteriori dettagli sul punto di incontro e l'orario di partenza via email o SMS prima della data del tour.</p>
                  <p>Se ha domande o necessita di assistenza, non esiti a contattarci.</p>
                </div>
              `
                  : `
                <p>La preghiamo di conservare questa email di conferma per i suoi archivi. Se ha domande, non esiti a contattarci.</p>
              `
              }

              <div class="contact-info">
                <h4>📞 Informazioni di Contatto</h4>
                <p><strong>📧 Booking:</strong> booking@qtours.tours</p>
                <p><strong>📧 Supporto:</strong> palma@qtours.tours</p>
                <p><strong>📞 Telefono:</strong> +97455472952</p>
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
              body: JSON.stringify({
          from: "Viaggi Del Qatar <noreply@qtours.dakaeitechnologies.com>",
          to: [customerEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log("Email sent successfully:", data)
      return Response.json({ success: true, data })
    } else {
      const error = await res.text()
      console.error("Failed to send email:", error)
      return Response.json(
        { error: "Failed to send booking confirmation email", details: error },
        { status: res.status },
      )
    }
  } catch (error) {
    console.error("Booking confirmation email error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

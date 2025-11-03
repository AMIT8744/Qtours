import jsPDF from "jspdf"
import QRCode from "qrcode"

interface BookingData {
  id: string
  booking_reference: string
  tour_date?: string | null
  tour_name: string
  ship_name: string
  customer_name: string
  email: string
  phone?: string
  adults: number
  children: number
  total_pax: number
  deposit: number
  remaining_balance: number
  total_payment: number
  location: string
  agent_name?: string
  commission?: number
  status: string
  notes?: string
  payment_location?: string
  tour_guide?: string
  vehicles?: string
  other?: string
  marketing_source?: string
  total_net?: number
  tours?: Array<{
    id: string
    tour_id: string
    tour_name: string
    ship_name: string
    location: string
    tour_date: string
    adults: number
    children: number
    total_pax: number
    price: number
    deposit: number
    remaining_balance: number
    notes?: string
  }>
}

export const generateReceiptPDF = async (booking: BookingData): Promise<Blob> => {
  try {
    console.log("Generating professional PDF with jsPDF for booking:", booking.id)
    console.log("Passenger data:", {
      total_pax: booking.total_pax,
      adults: booking.adults,
      children: booking.children
    })

    // Create new PDF document
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width

    // Generate QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
    const verificationUrl = `${baseUrl}/verify-receipt?ref=${encodeURIComponent(booking.booking_reference || booking.id)}`

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 120,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })

    // Add QR code image
    doc.addImage(qrCodeDataUrl, "PNG", 20, 20, 40, 40)
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.text("Scansiona per verificare", 40, 68, { align: "center" })

    // Header - Company name and title
    doc.setFontSize(18)
    doc.setTextColor(107, 15, 26) // #6b0f1a
    doc.text("Viaggi Del Qatar", 105, 30, { align: "center" })

    doc.setFontSize(16)
    doc.text("RICEVUTA DI PRENOTAZIONE", 105, 45, { align: "center" })

    // Company info on the right
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("Viaggi Del Qatar Tours", 200, 25, { align: "right" })
    doc.text("booking@qtours.tours", 200, 33, { align: "right" })
    doc.text("palma@qtours.tours", 200, 41, { align: "right" })
    doc.text("+97455472952", 200, 49, { align: "right" })
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 200, 57, { align: "right" })

    let yPosition = 80

    // Booking Information Section
    doc.setFontSize(14)
    doc.setTextColor(107, 15, 26)
    doc.text("Informazioni di Prenotazione", 20, yPosition)

    // Add underline
    doc.setLineWidth(0.5)
    doc.setDrawColor(107, 15, 26)
    doc.line(20, yPosition + 2, 190, yPosition + 2)

    yPosition += 15

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    // Booking details in two columns
    const leftColumn = [
      ["Riferimento Prenotazione:", booking.booking_reference || "N/A"],
      ["Stato:", (booking.status || "PENDING").toUpperCase()],
      ["Tour:", booking.tours ? `${booking.tours.length} tour` : "1 tour"],
    ]

    const rightColumn = [
      ["Passeggeri:", `${booking.total_pax || 0} (${booking.adults || 0} adulti, ${booking.children || 0} bambini)`],
      ["Nome Cliente:", booking.customer_name || "N/A"],
    ]

    // Left column
    leftColumn.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPosition + index * 8)
      doc.setFont("helvetica", "normal")
      doc.text(value, 70, yPosition + index * 8)
    })

    // Right column
    rightColumn.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 110, yPosition + index * 8)
      doc.setFont("helvetica", "normal")
      doc.text(value, 160, yPosition + index * 8)
    })

    yPosition += 35

    // Customer Information Section
    doc.setFontSize(14)
    doc.setTextColor(107, 15, 26)
    doc.text("Informazioni Cliente", 20, yPosition)
    doc.line(20, yPosition + 2, 190, yPosition + 2)
    yPosition += 15

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const customerInfo = [
      ["Nome:", booking.customer_name || "N/A"],
      ["Email:", booking.email || "N/A"],
      ["Telefono:", booking.phone || "N/A"],
    ]

    customerInfo.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPosition + index * 8)
      doc.setFont("helvetica", "normal")
      doc.text(value, 70, yPosition + index * 8)
    })

    yPosition += 35

    // Tour Details Section (Table)
    doc.setFontSize(14)
    doc.setTextColor(107, 15, 26)
    doc.text("Dettagli Tour", 20, yPosition)
    doc.line(20, yPosition + 2, 190, yPosition + 2)
    yPosition += 15

    // Table header
    doc.setFillColor(107, 15, 26)
    doc.rect(20, yPosition, 170, 10, "F")

    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text("Tour", 25, yPosition + 7)
    doc.text("Data", 80, yPosition + 7)
    doc.text("Nave", 115, yPosition + 7)
    doc.text("Pax", 145, yPosition + 7)
    doc.text("Prezzo", 165, yPosition + 7)

    yPosition += 10

    // Table rows
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    const tourCount = booking.tours?.length || 1
    const tableStartY = yPosition

    if (booking.tours && booking.tours.length > 0) {
      booking.tours.forEach((tour, index) => {
        const rowColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255]
        doc.setFillColor(rowColor[0], rowColor[1], rowColor[2])
        doc.rect(20, yPosition, 170, 8, "F")

        doc.text(tour.tour_name || "N/A", 25, yPosition + 6)
        doc.text(tour.tour_date ? new Date(tour.tour_date).toLocaleDateString() : "N/A", 80, yPosition + 6)
        doc.text(tour.ship_name || "-", 115, yPosition + 6)
        doc.text(String(tour.total_pax || 0), 145, yPosition + 6)
        doc.text(`€${Number(tour.price || 0).toFixed(2)}`, 165, yPosition + 6)

        yPosition += 8
      })
    } else {
      // Single tour row
      doc.setFillColor(245, 245, 245)
      doc.rect(20, yPosition, 170, 8, "F")

      doc.text(booking.tour_name || "N/A", 25, yPosition + 6)
      doc.text(booking.tour_date ? new Date(booking.tour_date).toLocaleDateString() : "N/A", 80, yPosition + 6)
      doc.text(booking.ship_name || "-", 115, yPosition + 6)
      doc.text(String(booking.total_pax || 0), 145, yPosition + 6)
      doc.text(`€${Number(booking.total_payment || 0).toFixed(2)}`, 165, yPosition + 6)

      yPosition += 8
    }

    // Add border around table
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.1)
    doc.rect(20, tableStartY - 10, 170, tourCount * 8 + 10)

    yPosition += 20

    // Check if Payment Summary section will fit on current page
    // Payment Summary needs about 80px (title + 6 lines + spacing)
    const paymentSectionHeight = 80
    const verificationSectionHeight = 40
    const footerHeight = 50
    const requiredSpace = paymentSectionHeight + verificationSectionHeight + footerHeight

    if (yPosition + requiredSpace > pageHeight - 20) {
      // Start Payment Summary on new page
      doc.addPage()
      yPosition = 30
    }

    // Payment Summary Section
    doc.setFontSize(14)
    doc.setTextColor(107, 15, 26)
    doc.text("Riepilogo Pagamento", 20, yPosition)
    doc.line(20, yPosition + 2, 190, yPosition + 2)
    yPosition += 15

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const paymentInfo = [
      ["Importo Deposito Totale:", `€ ${Number(booking.deposit || 0).toFixed(2)}`],
      ["Saldo Rimanente Totale:", `€ ${Number(booking.remaining_balance || 0).toFixed(2)}`],
      ["Pagamento Totale:", `€ ${Number(booking.total_payment || 0).toFixed(2)}`],
      [
        "Stato Pagamento:",
        booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "In Attesa",
      ],
      ["Luogo Pagamento:", booking.payment_location || "N/A"],
      [
        "Importo NET Totale:",
        `€ ${Number(booking.total_net || booking.total_payment - (booking.commission || 0)).toFixed(2)}`,
      ],
    ]

    paymentInfo.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold")
      doc.text(label, 20, yPosition + index * 8)
      doc.setFont("helvetica", "normal")
      doc.text(value, 100, yPosition + index * 8)
    })

    yPosition += 60

    // Verification section
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Verifica questa ricevuta", 105, yPosition, { align: "center" })
    doc.setFontSize(10)
    doc.text("Scansiona il codice QR o visita:", 105, yPosition + 8, { align: "center" })
    doc.setFontSize(8)
    doc.text(verificationUrl, 105, yPosition + 16, { align: "center" })

    yPosition += 40

    // Footer - always at bottom with proper spacing
    const currentPageHeight = doc.internal.pageSize.height
    const footerStartY = Math.max(yPosition, currentPageHeight - 40)

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Grazie per aver scelto Viaggi Del Qatar per la tua esperienza di tour.", 105, footerStartY, {
      align: "center",
    })
    doc.text("Questa è una ricevuta generata elettronicamente e non richiede una firma.", 105, footerStartY + 8, {
      align: "center",
    })
    doc.text(
      "Per qualsiasi domanda, contatta il nostro servizio clienti a booking@qtours.tours",
      105,
      footerStartY + 16,
      {
        align: "center",
      },
    )

    // Page number
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.text(`Pagina ${i} di ${totalPages}`, 200, currentPageHeight - 10, { align: "right" })
    }

    // Convert to blob
    const pdfBlob = doc.output("blob")
    console.log("Professional PDF generated with automatic page breaks")

    return pdfBlob
  } catch (error) {
    console.error("Error generating professional PDF with jsPDF:", error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export default generateReceiptPDF

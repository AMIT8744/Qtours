"use client"

import { Document, Page, Text, View, StyleSheet, Image, Font, pdf } from "@react-pdf/renderer"
import { format } from "date-fns"

// Register fonts with error handling
try {
  Font.register({
    family: "Roboto",
    fonts: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
        fontWeight: 400,
      },
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
        fontWeight: 700,
      },
    ],
  })
} catch (error) {
  console.warn("Failed to register fonts:", error)
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica", // Fallback to built-in font
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: "1px solid #6b0f1a",
    paddingBottom: 15,
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: "contain",
  },
  companyInfo: {
    fontSize: 10,
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 30,
    color: "#6b0f1a",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: "#6b0f1a",
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderBottom: "1px solid #6b0f1a",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    borderBottomStyle: "solid",
    paddingVertical: 8,
    marginBottom: 2,
  },
  col1: {
    width: "30%",
    fontSize: 10,
    color: "#555555",
    fontWeight: 700,
  },
  col2: {
    width: "70%",
    fontSize: 10,
  },
  paymentSection: {
    marginTop: 30,
    borderTop: "1px solid #EEEEEE",
    paddingTop: 15,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginBottom: 2,
  },
  paymentLabel: {
    fontSize: 10,
    color: "#555555",
    fontWeight: 700,
  },
  paymentValue: {
    fontSize: 10,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#6b0f1a",
    borderTopStyle: "solid",
    paddingVertical: 8,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6b0f1a",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: "center",
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    borderTopStyle: "solid",
    paddingTop: 15,
    marginTop: 30,
  },
  status: {
    position: "absolute",
    top: 100,
    right: 30,
    color: "#6b0f1a",
    fontSize: 24,
    fontWeight: 700,
    transform: "rotate(-20deg)",
    opacity: 0.3,
  },
  notesBox: {
    border: "1px solid #EEEEEE",
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    borderBottomStyle: "solid",
    marginVertical: 15,
  },
  toursTable: {
    marginTop: 10,
    marginBottom: 20,
    border: "1px solid #DDDDDD",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#6b0f1a",
    borderBottom: "1px solid #DDDDDD",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #DDDDDD",
    backgroundColor: "#FFFFFF",
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottom: "1px solid #DDDDDD",
    backgroundColor: "#F9F9F9",
  },
  tableCol1: {
    width: "35%",
    fontSize: 8,
    borderRight: "1px solid #DDDDDD",
    padding: 8,
  },
  tableCol2: {
    width: "20%",
    fontSize: 8,
    textAlign: "center",
    borderRight: "1px solid #DDDDDD",
    padding: 8,
  },
  tableCol3: {
    width: "25%",
    fontSize: 8,
    borderRight: "1px solid #DDDDDD",
    padding: 8,
  },
  tableCol4: {
    width: "10%",
    fontSize: 8,
    textAlign: "center",
    borderRight: "1px solid #DDDDDD",
    padding: 8,
  },
  tableCol5: {
    width: "10%",
    fontSize: 8,
    textAlign: "right",
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#FFFFFF",
    padding: 8,
  },
})

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

// PDF Document component with better error handling
const BookingReceiptDocument = ({ booking }: { booking: BookingData }) => {
  // Validate booking data
  if (!booking) {
    throw new Error("Booking data is required")
  }

  // Format date with error handling
  let formattedDate = "N/A"
  try {
    if (booking.tour_date) {
      formattedDate = format(new Date(booking.tour_date), "PPP")
    }
  } catch (error) {
    console.error("Error formatting date:", error)
  }

  const currentDate = format(new Date(), "PPP")

  // Check if this is a multi-tour booking
  const isMultiTour = booking.tours && booking.tours.length > 1

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            src="https://i.ibb.co/hR1V7jBX/image.png"
            style={styles.logo}
          />
          <View style={styles.companyInfo}>
            <Text>Viaggi Del Qatar</Text>
            <Text>Tours Booking Management</Text>
            <Text>booking@qtours.tours</Text>
            <Text>palma@qtours.tours</Text>
            <Text>+97455472952</Text>
            <Text>Date: {currentDate}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>RICEVUTA DI PRENOTAZIONE</Text>

        {/* Status Watermark */}
        <Text style={styles.status}>{(booking.status || "PENDING").toUpperCase()}</Text>

        {/* Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni di Prenotazione</Text>
          <View style={styles.row}>
            <Text style={styles.col1}>Riferimento Prenotazione:</Text>
            <Text style={styles.col2}>{booking.booking_reference || "N/A"}</Text>
          </View>

          {isMultiTour ? (
            <View style={styles.row}>
              <Text style={styles.col1}>Tour:</Text>
              <Text style={styles.col2}>Tour Multipli (vedi dettagli sotto)</Text>
            </View>
          ) : (
            <View style={styles.row}>
              <Text style={styles.col1}>Tour:</Text>
              <Text style={styles.col2}>{booking.tour_name || "N/A"}</Text>
            </View>
          )}

          {!isMultiTour && (
            <>
              <View style={styles.row}>
                <Text style={styles.col1}>Nave:</Text>
                <Text style={styles.col2}>{booking.ship_name || "-"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.col1}>Località:</Text>
                <Text style={styles.col2}>{booking.location || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.col1}>Data Tour:</Text>
                <Text style={styles.col2}>{formattedDate}</Text>
              </View>
            </>
          )}

          <View style={styles.row}>
            <Text style={styles.col1}>Passeggeri:</Text>
            <Text style={styles.col2}>
              {booking.total_pax || 0} ({booking.adults || 0} adulti, {booking.children || 0} bambini)
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.col1}>Nome Cliente:</Text>
            <Text style={styles.col2}>{booking.customer_name || "N/A"}</Text>
          </View>

          {booking.vehicles && (
            <View style={styles.row}>
              <Text style={styles.col1}>Veicoli:</Text>
              <Text style={styles.col2}>{booking.vehicles}</Text>
            </View>
          )}

          {booking.marketing_source && (
            <View style={styles.row}>
              <Text style={styles.col1}>Fonte Marketing:</Text>
              <Text style={styles.col2}>{booking.marketing_source}</Text>
            </View>
          )}
        </View>

        {/* Tour Details for Multi-Tour Bookings */}
        {booking.tours && booking.tours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dettagli Tour</Text>
            <View style={styles.toursTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol1, styles.tableHeaderText]}>Tour</Text>
                <Text style={[styles.tableCol2, styles.tableHeaderText]}>Data</Text>
                <Text style={[styles.tableCol3, styles.tableHeaderText]}>Nave</Text>
                <Text style={[styles.tableCol4, styles.tableHeaderText]}>Pax</Text>
                <Text style={[styles.tableCol5, styles.tableHeaderText]}>Prezzo</Text>
              </View>

              {booking.tours.map((tour, index) => {
                let tourDate = "N/A"
                try {
                  if (tour.tour_date) {
                    tourDate = format(new Date(tour.tour_date), "dd/MM/yyyy")
                  }
                } catch (error) {
                  console.error("Error formatting tour date:", error)
                }

                const shipName = tour.ship_name && tour.ship_name.trim() !== "" ? tour.ship_name : "-"

                return (
                  <View style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate} key={index}>
                    <Text style={styles.tableCol1}>{tour.tour_name || "N/A"}</Text>
                    <Text style={styles.tableCol2}>{tourDate}</Text>
                    <Text style={styles.tableCol3}>{shipName}</Text>
                    <Text style={styles.tableCol4}>{tour.total_pax || 0}</Text>
                    <Text style={styles.tableCol5}>€{Number(tour.price || 0).toFixed(2)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.col1}>Nome:</Text>
            <Text style={styles.col2}>{booking.customer_name || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.col1}>Email:</Text>
            <Text style={styles.col2}>{booking.email || "N/A"}</Text>
          </View>
          {booking.phone && (
            <View style={styles.row}>
              <Text style={styles.col1}>Telefono:</Text>
              <Text style={styles.col2}>{booking.phone}</Text>
            </View>
          )}
          {booking.agent_name && (
            <View style={styles.row}>
              <Text style={styles.col1}>Agente Prenotazione:</Text>
              <Text style={styles.col2}>{booking.agent_name}</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Pagamento</Text>
          <View style={styles.paymentSection}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Importo Deposito:</Text>
              <Text style={styles.paymentValue}>€{Number(booking.deposit || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Saldo Rimanente:</Text>
              <Text style={styles.paymentValue}>€{Number(booking.remaining_balance || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pagamento Totale:</Text>
              <Text style={styles.totalValue}>€{Number(booking.total_payment || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Stato Pagamento:</Text>
              <Text style={styles.paymentValue}>
                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "In Attesa"}
              </Text>
            </View>
            {booking.payment_location && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Luogo Pagamento:</Text>
                <Text style={styles.paymentValue}>{booking.payment_location}</Text>
              </View>
            )}

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Totale NET:</Text>
              <Text style={styles.paymentValue}>
                €{Number(booking.total_net || booking.total_payment - (booking.commission || 0)).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note Aggiuntive</Text>
            <View style={styles.notesBox}>
              <Text>{booking.notes}</Text>
            </View>
          </View>
        )}

        {/* Other information */}
        {booking.other && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Altre Informazioni</Text>
            <View style={styles.notesBox}>
              <Text>{booking.other}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Grazie per aver scelto Viaggi Del Qatar per la tua esperienza di tour.</Text>
          <Text>Questa è una ricevuta generata elettronicamente e non richiede una firma.</Text>
          <Text>Per qualsiasi domanda, contatta il nostro servizio clienti a booking@qtours.tours</Text>
        </View>
      </Page>
    </Document>
  )
}

// Function to generate PDF blob with better error handling
export const generatePDF = async (booking: BookingData): Promise<Blob> => {
  try {
    if (!booking) {
      throw new Error("Booking data is required")
    }

    console.log("Generating PDF for booking:", booking.id)

    const blob = await pdf(<BookingReceiptDocument booking={booking} />).toBlob()

    if (!blob) {
      throw new Error("Failed to generate PDF blob")
    }

    console.log("PDF generated successfully")
    return blob
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_xxxxxxxxx"

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export async function POST(request: Request) {
  try {
    const emailData: EmailData = await request.json()

    const { to, subject, html, from = "Viaggi Del Qatar <noreply@resend.dev>" } = emailData

    if (!to || !subject || !html) {
      return Response.json({ error: "Missing required email data" }, { status: 400 })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return Response.json({ success: true, data })
    } else {
      const error = await res.text()
      return Response.json({ error: "Failed to send email", details: error }, { status: res.status })
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

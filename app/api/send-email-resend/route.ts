import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("📧 API route called")
    console.log("📧 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("📧 RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0)
    
    const body = await request.json()
    const { to, subject, html, text, from = "noreply@qtours.dakaeitechnologies.com" } = body

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: to, subject, and either html or text content are required" 
        }, 
        { status: 400 }
      )
    }

    console.log("📧 Sending email via Resend:", {
      to,
      from,
      subject,
      hasHtml: !!html,
      hasText: !!text
    })

    // Prepare email data for Resend API
    const emailData: any = {
      from,
      to,
      subject,
    }

    if (html) {
      emailData.html = html
    }

    if (text) {
      emailData.text = text
    }

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    console.log("📡 Resend API response:", {
      status: response.status,
      success: response.ok,
      result
    })

    if (!response.ok) {
      console.error("❌ Resend API error:", result)
      return NextResponse.json(
        {
          success: false,
          error: result.message || `Failed to send email (${response.status})`,
          details: result
        },
        { status: response.status }
      )
    }

    console.log("✅ Email sent successfully via Resend:", result)

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: result.id,
      result
    })

  } catch (error) {
    console.error("💥 Error sending email via Resend:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 
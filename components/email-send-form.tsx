"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface EmailSendFormProps {
  title?: string
  description?: string
  defaultSubject?: string
  defaultBody?: string
  showSuccessMessage?: boolean
  onSuccess?: () => void
  className?: string
}

export default function EmailSendForm({
  title = "Send Email",
  description = "Send an email message",
  defaultSubject = "",
  defaultBody = "",
  showSuccessMessage = true,
  onSuccess,
  className = ""
}: EmailSendFormProps) {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: defaultSubject,
    body: defaultBody
  })
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailData.to || !emailData.subject || !emailData.body) {
      setResult({
        success: false,
        error: "Please fill in all required fields"
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
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.body,
          text: emailData.body.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Clear form on success
        setEmailData({
          to: "",
          subject: defaultSubject,
          body: defaultBody
        })
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <Label htmlFor="to">To Email *</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={emailData.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={emailData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="body">Email Body *</Label>
            <Textarea
              id="body"
              placeholder="Enter your email message here..."
              rows={6}
              value={emailData.body}
              onChange={(e) => handleInputChange("body", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use basic HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, etc.
            </p>
          </div>

          <Button 
            type="submit"
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </form>

        {/* Show result message */}
        {result && showSuccessMessage && (
          <Alert className={`mt-4 ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
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
        )}
      </CardContent>
    </Card>
  )
} 
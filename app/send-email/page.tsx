import EmailSendForm from "@/components/email-send-form"

export default function SendEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Email</h1>
          <p className="text-gray-600">Send an email message to any recipient</p>
        </div>
        
        <EmailSendForm 
          title="Send Email Message"
          description="Fill in the details below to send an email"
          defaultSubject=""
          defaultBody=""
        />
      </div>
    </div>
  )
} 
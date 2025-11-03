"use client"

import { Button } from "@/components/ui/button"

interface WhatsAppFloatingButtonProps {
  hideOnDashboard?: boolean
  className?: string
}

export default function WhatsAppFloatingButton({ 
  hideOnDashboard = false,
  className = ""
}: WhatsAppFloatingButtonProps) {
  const phoneNumber = "+97455472952"
  const message = "Ciao! Vorrei informazioni sui vostri tour." // Default message in Italian
  
  const handleWhatsAppClick = () => {
    // Create WhatsApp URL with the phone number and message
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')
  }

  // Hide on dashboard if specified
  if (hideOnDashboard && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 ${className}`}>
      <Button
        onClick={handleWhatsAppClick}
        size="lg"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 w-12 h-12 md:w-14 md:h-14 p-0"
        title="Contattaci su WhatsApp"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-7 w-7 md:h-10 md:w-10"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
          <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
        </svg>
      </Button>
    </div>
  )
} 
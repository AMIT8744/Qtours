"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SuccessToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export default function SuccessToast({ message, duration = 5000, onClose }: SuccessToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => {
              setVisible(false)
              if (onClose) onClose()
            }}
            className="ml-4 p-1 rounded-full hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

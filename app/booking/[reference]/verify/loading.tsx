import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function VerifyPaymentLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Loading...</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Loading Verification Page...</h3>
              <p className="text-sm text-gray-600 mt-2">
                Please wait while we load the payment verification page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
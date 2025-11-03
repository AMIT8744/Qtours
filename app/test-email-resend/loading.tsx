import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TestEmailResendLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground">Loading email test page...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
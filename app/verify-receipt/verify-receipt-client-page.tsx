"use client"

import { Suspense } from "react"
import VerifyReceiptClient from "./verify-receipt-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyReceiptClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-[120px] w-[120px]" />
              </div>
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-80 mx-auto mt-2" />
            </div>

            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40 mt-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyReceiptClient />
    </Suspense>
  )
}

import { Suspense } from "react"
import { BusinessSettingsForm } from "@/components/business-settings-form"
import { TermsAndConditionsForm } from "@/components/terms-and-conditions-form"
import { DibsyModeForm } from "@/components/dibsy-mode-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and configuration.</p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <BusinessSettingsForm />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Payment Gateway</h2>
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Payment Gateway Settings</CardTitle>
                  <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <DibsyModeForm />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Legal</h2>
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
                  <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            }
          >
            <TermsAndConditionsForm />
          </Suspense>
        </section>
      </div>
    </div>
  )
}

import { getSystemSetting } from "@/app/actions/system-settings-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TermsPage() {
  let termsContent = ""
  let businessEmail = ""

  try {
    ;[termsContent, businessEmail] = await Promise.all([
      getSystemSetting("terms_and_conditions"),
      getSystemSetting("business_email"),
    ])
  } catch (error) {
    console.error("Error loading terms page data:", error)
    termsContent = "Terms and conditions are currently unavailable. Please try again later."
    businessEmail = "info@viaggidelqatar.com"
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {termsContent || "Terms and conditions have not been set yet. Please contact the administrator."}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms and Conditions, please contact us at:{" "}
              <a href={`mailto:${businessEmail}`} className="text-blue-600 hover:underline">
                {businessEmail}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

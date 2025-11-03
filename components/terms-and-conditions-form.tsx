"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateTermsAndConditions, getSystemSetting } from "@/app/actions/system-settings-actions"

export function TermsAndConditionsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [content, setContent] = useState("")

  useEffect(() => {
    async function loadTerms() {
      setIsLoadingData(true)
      try {
        console.log("Loading terms and conditions...")

        const termsContent = await getSystemSetting("terms_and_conditions")
        console.log("Loaded terms:", termsContent)

        setContent(termsContent || "Terms and conditions have not been set yet. Please contact the administrator.")
      } catch (error) {
        console.error("Error loading terms and conditions:", error)
        toast.error("Failed to load terms and conditions")
        setContent("Terms and conditions have not been set yet. Please contact the administrator.")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadTerms()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateTermsAndConditions(formData)

      if (result.success) {
        toast.success(result.message || "Terms and conditions updated successfully")
      } else {
        toast.error(result.error || "Failed to update terms and conditions")
      }
    } catch (error) {
      console.error("Error submitting terms form:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
          <CardDescription>Loading terms and conditions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
        <CardDescription>
          Update your website's terms and conditions. This will be displayed on the public terms page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="terms_content">Terms and Conditions Content *</Label>
            <Textarea
              id="terms_content"
              name="terms_content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your terms and conditions here..."
              className="min-h-[300px]"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Write your complete terms and conditions. This will be publicly visible at /terms
            </p>
          </div>

          <Button type="submit" disabled={isLoading || !content.trim()}>
            {isLoading ? "Saving..." : "Save Terms and Conditions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

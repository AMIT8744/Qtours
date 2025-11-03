"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateBusinessSettings, getSystemSetting } from "@/app/actions/system-settings-actions"

export function BusinessSettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    business_email: "",
    business_phone: "",
    business_location: "",
  })

  useEffect(() => {
    async function loadSettings() {
      setIsLoadingData(true)
      try {
        console.log("Loading business settings...")

        const [email, phone, location] = await Promise.all([
          getSystemSetting("business_email"),
          getSystemSetting("business_phone"),
          getSystemSetting("business_location"),
        ])

        console.log("Loaded settings:", { email, phone, location })

        setFormData({
          business_email: email || "info@viaggidelqatar.com",
          business_phone: phone || "+974 xxxx xxxx",
          business_location: location || "Doha, Qatar",
        })
      } catch (error) {
        console.error("Error loading business settings:", error)
        toast.error("Failed to load business settings")

        // Set default values on error
        setFormData({
          business_email: "info@viaggidelqatar.com",
          business_phone: "+974 xxxx xxxx",
          business_location: "Doha, Qatar",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSettings()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formDataObj = new FormData(event.currentTarget)
      const result = await updateBusinessSettings(formDataObj)

      if (result.success) {
        toast.success(result.message || "Business settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update business settings")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Loading business settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your business contact information and location details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business_email">Business Email *</Label>
            <Input
              id="business_email"
              name="business_email"
              type="email"
              value={formData.business_email}
              onChange={(e) => handleInputChange("business_email", e.target.value)}
              placeholder="info@yourcompany.com"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Main contact email for your business</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_phone">Business Phone *</Label>
            <Input
              id="business_phone"
              name="business_phone"
              type="tel"
              value={formData.business_phone}
              onChange={(e) => handleInputChange("business_phone", e.target.value)}
              placeholder="+974 xxxx xxxx"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Primary phone number with country code</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_location">Business Location *</Label>
            <Input
              id="business_location"
              name="business_location"
              type="text"
              value={formData.business_location}
              onChange={(e) => handleInputChange("business_location", e.target.value)}
              placeholder="Doha, Qatar"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">Main business location or headquarters</p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Business Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { getSystemSetting, updateDibsyMode } from "@/app/actions/system-settings-actions"

export function DibsyModeForm() {
  const [dibsyMode, setDibsyMode] = useState<string>("sandbox")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadDibsyMode = async () => {
      try {
        const mode = await getSystemSetting("dibsy_mode")
        setDibsyMode(mode || "sandbox")
      } catch (err) {
        console.error("Error loading Dibsy mode:", err)
        setError("Failed to load Dibsy mode setting")
      } finally {
        setIsLoading(false)
      }
    }

    loadDibsyMode()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("dibsy_mode", dibsyMode)

      const result = await updateDibsyMode(formData)

      if (result.success) {
        setSuccess(result.message || "Dibsy mode updated successfully")
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || "Failed to update Dibsy mode")
      }
    } catch (err) {
      console.error("Error updating Dibsy mode:", err)
      setError("Failed to update Dibsy mode")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Gateway Settings
        </CardTitle>
        <CardDescription>
          Configure Dibsy payment gateway mode. Use sandbox for testing and live for production.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="dibsy_mode">Dibsy Mode</Label>
            <Select value={dibsyMode} onValueChange={setDibsyMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select Dibsy mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Sandbox (Testing)
                  </div>
                </SelectItem>
                <SelectItem value="live">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Live (Production)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {dibsyMode === "sandbox" 
                ? "Sandbox mode is for testing purposes. No real payments will be processed."
                : "Live mode processes real payments. Make sure you have configured your live API keys."
              }
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Mode Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span><strong>Sandbox:</strong> Test environment with fake payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Live:</strong> Production environment with real payments</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? "Updating..." : "Update Dibsy Mode"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 
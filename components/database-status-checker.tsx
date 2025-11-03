"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Database, RefreshCw } from "lucide-react"

export default function DatabaseStatusChecker() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/db-diagnostic", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data.diagnostics)
    } catch (err) {
      console.error("Error checking database status:", err)
      setError(err instanceof Error ? err.message : "Unknown error checking database status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
        <CardDescription>Check if the application is using a real database or mock data</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert variant={status.hasDbUrl ? "default" : "warning"}>
              {status.hasDbUrl ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{status.hasDbUrl ? "DATABASE_URL is set" : "DATABASE_URL is not set"}</AlertTitle>
              <AlertDescription>
                {status.hasDbUrl
                  ? "The application has a database connection string configured."
                  : "The application is using mock data because no database connection string is available."}
              </AlertDescription>
            </Alert>

            <Alert variant={status.connectionStatus?.connected ? "default" : "warning"}>
              {status.connectionStatus?.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.connectionStatus?.connected
                  ? status.connectionStatus?.isMock
                    ? "Using Mock Database"
                    : "Database Connection Successful"
                  : "Database Connection Failed"}
              </AlertTitle>
              <AlertDescription>{status.connectionStatus?.message}</AlertDescription>
            </Alert>

            <div className="mt-4 border rounded-md p-4">
              <h3 className="font-medium mb-2">Diagnostic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-mono">{status.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has DATABASE_URL:</span>
                  <span className="font-mono">{status.hasDbUrl ? "Yes" : "No"}</span>
                </div>
                {status.hasDbUrl && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DATABASE_URL Length:</span>
                    <span className="font-mono">{status.databaseUrlLength} chars</span>
                  </div>
                )}
                {status.hasDbUrl && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DATABASE_URL Prefix:</span>
                    <span className="font-mono">{status.databaseUrlPrefix}</span>
                  </div>
                )}
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Available DB Env Vars:</span>
                  <span className="font-mono">{status.availableEnvVars.join(", ") || "None"}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-mono">{new Date(status.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkStatus} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

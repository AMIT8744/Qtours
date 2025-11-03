"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { login } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [redirecting, setRedirecting] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    // Check for the authenticated cookie
    const isAuthenticated = document.cookie.includes("authenticated=true")

    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create form data from state
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      // Set a client-side timeout to handle very slow responses
      const loginPromise = login(formData)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out")), 20000),
      )

      // Race between login and timeout
      const result = (await Promise.race([loginPromise, timeoutPromise])) as any

      if (result.success) {
        console.log("Login successful, preparing to redirect")

        // Set a flag to show we're redirecting
        setRedirecting(true)

        // Force a small delay to ensure cookies are set
        setTimeout(() => {
          // Double-check that the cookie is set
          if (document.cookie.includes("authenticated=true")) {
            console.log("Authentication cookie found, redirecting")
            // Use window.location for a hard redirect instead of router.push
            window.location.href = "/dashboard"
          } else {
            console.log("Authentication cookie not found, using alternative redirect")
            // Try router.push as a fallback
            router.push("/dashboard")
          }
        }, 500)
      } else {
        setError(result.message || "Invalid credentials")
        console.error("Login failed:", result.message)
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login service is temporarily unavailable. Please try again.")
    } finally {
      if (!redirecting) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="https://escursionincrociera.com/wp-content/uploads/2024/05/Untitled-design.png"
            alt="Viaggi Del Qatar Logo"
            width={120}
            height={120}
            className="bg-white p-2 shadow-sm mb-4"
            priority
          />
          <h1 className="text-4xl font-bold tracking-tight">Viaggi Del Qatar</h1>
          <p className="text-lg text-gray-600">Tours Booking Management System</p>
        </div>

        {redirecting && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center text-green-600">
            Login successful! Redirecting to dashboard...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-600">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the booking system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || redirecting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || redirecting}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#7f1d1d] hover:bg-[#5f1515]"
                disabled={isLoading || redirecting}
              >
                {isLoading ? "Logging in..." : redirecting ? "Redirecting..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Viaggi Del Qatar. All rights reserved.
        </p>
      </div>
    </div>
  )
}

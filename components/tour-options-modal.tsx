"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Percent, Euro, Gift, X } from "lucide-react"

interface TourOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyOptions: (options: TourOptions) => void
  tourName: string
  originalPrice: number
}

export interface TourOptions {
  discountType: "none" | "percentage" | "fixed" | "free"
  discountValue: number
  finalPrice: number
}

export default function TourOptionsModal({
  isOpen,
  onClose,
  onApplyOptions,
  tourName,
  originalPrice,
}: TourOptionsModalProps) {
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed" | "free">("none")
  const [discountValue, setDiscountValue] = useState<number>(0)

  const calculateFinalPrice = () => {
    switch (discountType) {
      case "free":
        return 0
      case "percentage":
        return Math.max(0, originalPrice - (originalPrice * discountValue / 100))
      case "fixed":
        return Math.max(0, originalPrice - discountValue)
      default:
        return originalPrice
    }
  }

  const finalPrice = calculateFinalPrice()
  const discountAmount = originalPrice - finalPrice

  const handleApply = () => {
    onApplyOptions({
      discountType,
      discountValue,
      finalPrice,
    })
    onClose()
  }

  const handleReset = () => {
    setDiscountType("none")
    setDiscountValue(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#6b0f1a]" />
            Tour Options
          </DialogTitle>
          <DialogDescription>
            Apply special pricing options for <strong>{tourName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Price Display */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Original Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                €{originalPrice.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Discount Type Selection */}
          <div className="space-y-3">
            <Label>Discount Type</Label>
            <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    No Discount
                  </div>
                </SelectItem>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentage Discount
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    Fixed Amount Discount
                  </div>
                </SelectItem>
                <SelectItem value="free">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Free Tour
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount Value Input */}
          {discountType !== "none" && discountType !== "free" && (
            <div className="space-y-3">
              <Label>
                {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : originalPrice}
                  step={discountType === "percentage" ? 1 : 0.01}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {discountType === "percentage" ? "%" : "€"}
                </div>
              </div>
            </div>
          )}

          {/* Price Preview */}
          <Card className="border-2 border-[#6b0f1a] bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-[#6b0f1a]">Final Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#6b0f1a]">
                  €{finalPrice.toFixed(2)}
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Save €{discountAmount.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-[#6b0f1a] hover:bg-[#8a1325]"
            >
              Apply Options
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
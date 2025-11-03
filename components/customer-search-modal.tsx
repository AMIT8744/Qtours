"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Phone, User } from "lucide-react"
import { searchCustomers } from "@/app/actions/customer-actions"
import { debounce } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface CustomerSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCustomer: (customer: Customer) => void
}

export default function CustomerSearchModal({ open, onOpenChange, onSelectCustomer }: CustomerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setHasSearched(true)

      try {
        const results = await searchCustomers(term)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching customers:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [],
  )

  // Trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Customers</DialogTitle>
          <DialogDescription>Search by name, email, or phone number</DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <Input
            placeholder="Start typing to search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : hasSearched && searchResults.length === 0 && searchTerm.trim() !== "" ? (
            <div className="text-center py-8 text-muted-foreground">No customers found matching "{searchTerm}"</div>
          ) : searchTerm.trim() === "" ? (
            <div className="text-center py-8 text-muted-foreground">Type to search for customers</div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{customer.name}</h3>
                    </div>
                    <Badge variant="outline">Customer</Badge>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

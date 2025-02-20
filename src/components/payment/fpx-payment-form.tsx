'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

const FPX_BANKS = [
  { id: 'MBB0227', name: 'Maybank2U' },
  { id: 'PHBMMYKL', name: 'Public Bank' },
  { id: 'CIBBMYKL', name: 'CIMB Clicks' },
  { id: 'RHBBMYKL', name: 'RHB Now' },
  { id: 'HLBBMYKL', name: 'Hong Leong Connect' },
  // Add more banks
]

interface FPXPaymentFormProps {
  amount: number
  currency: string
  orderId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function FPXPaymentForm({
  amount,
  currency,
  orderId,
  onSuccess,
  onCancel
}: FPXPaymentFormProps) {
  const [selectedBank, setSelectedBank] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank) return

    setLoading(true)
    try {
      // Implement FPX payment initiation
      // Redirect to bank's page
    } catch (error) {
      console.error('FPX payment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        value={selectedBank}
        onValueChange={setSelectedBank}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select your bank" />
        </SelectTrigger>
        <SelectContent>
          {FPX_BANKS.map(bank => (
            <SelectItem key={bank.id} value={bank.id}>
              {bank.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedBank || loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  )
} 
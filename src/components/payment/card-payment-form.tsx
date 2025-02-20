'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface CardPaymentFormProps {
  amount: number
  currency: string
  orderId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function CardPaymentForm({
  amount,
  currency,
  orderId,
  onSuccess,
  onCancel
}: CardPaymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/payments/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          card: cardData
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      // Handle redirect URL if present
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
        return
      }

      onSuccess(result.id)
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-name">Cardholder Name</Label>
        <Input
          id="card-name"
          placeholder="Name on card"
          value={cardData.name}
          onChange={e => setCardData({ ...cardData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-number">Card Number</Label>
        <Input
          id="card-number"
          placeholder="1234 5678 9012 3456"
          value={cardData.number}
          onChange={e => setCardData({ ...cardData, number: e.target.value })}
          required
          maxLength={19}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">Expiry Date</Label>
          <Input
            id="card-expiry"
            placeholder="MM/YY"
            value={cardData.expiry}
            onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
            required
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-cvc">CVC</Label>
          <Input
            id="card-cvc"
            placeholder="123"
            value={cardData.cvc}
            onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
            required
            maxLength={4}
            type="password"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : `Pay ${currency} ${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
} 
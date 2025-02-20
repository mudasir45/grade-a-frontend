'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PaymentMethod } from '@/lib/types/payment'
import Image from 'next/image'
import { useState } from 'react'

interface EWalletPaymentFormProps {
  method: PaymentMethod
  amount: number
  currency: string
  orderId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function EWalletPaymentForm({
  method,
  amount,
  currency,
  orderId,
  onSuccess,
  onCancel
}: EWalletPaymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Initiate e-wallet payment
      const response = await fetch('/api/payments/process-ewallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          walletType: method.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed')
      }

      // Redirect to e-wallet's payment page
      window.location.href = result.redirectUrl
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
      <div className="rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          <Image
            src={method.logo}
            alt={method.name}
            width={48}
            height={32}
            className="object-contain"
          />
          <div>
            <p className="font-medium">{method.name}</p>
            <p className="text-sm text-muted-foreground">
              Amount: {currency} {amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </div>
    </form>
  )
} 
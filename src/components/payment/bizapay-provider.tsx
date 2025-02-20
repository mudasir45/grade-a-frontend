'use client'

import { useToast } from '@/hooks/use-toast'
import { BizapayAPI } from '@/lib/api/bizapay'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BizapayProviderProps {
  amount: number
  currency: string
  orderId: string
  description: string
  customerEmail: string
  onSuccess: (paymentId: string) => void
  onCancel: () => void
}

export function BizapayProvider({
  amount,
  currency,
  orderId,
  description,
  customerEmail,
  onSuccess,
  onCancel
}: BizapayProviderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const initializePayment = async () => {
    setLoading(true)
    try {
      const { payment, redirectUrl } = await BizapayAPI.createPayment({
        amount,
        currency,
        orderId,
        description,
        customerEmail,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        webhookUrl: `${window.location.origin}/api/webhooks/bizapay`
      })

      // Redirect to Bizapay payment page
      window.location.href = redirectUrl
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to initialize payment',
        variant: 'destructive'
      })
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializePayment()
  }, [])

  if (loading) {
    return <div>Initializing payment...</div>
  }

  return null
} 
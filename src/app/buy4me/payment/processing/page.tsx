'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentAPI } from '@/lib/api/payment'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentProcessingPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [error, setError] = useState('')

  useEffect(() => {
    const paymentIntentId = params.get('payment_intent')
    if (!paymentIntentId) {
      router.push('/buy4me/payment/error?error=Invalid payment reference')
      return
    }

    const checkStatus = async () => {
      try {
        const result = await PaymentAPI.getPaymentStatus(paymentIntentId)
        
        switch (result.status) {
          case 'succeeded':
            setStatus('success')
            setTimeout(() => router.push(`/buy4me/payment/success?payment_intent=${paymentIntentId}`), 2000)
            break
          case 'canceled':
            setStatus('failed')
            setError('Payment was cancelled')
            setTimeout(() => router.push('/buy4me/payment/error?error=Payment cancelled'), 2000)
            break
          default:
            setTimeout(checkStatus, 2000)
        }
      } catch (error) {
        setStatus('failed')
        setError(error instanceof Error ? error.message : 'Payment verification failed')
        setTimeout(() => router.push('/buy4me/payment/error'), 2000)
      }
    }

    checkStatus()
  }, [params, router])

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            Processing Payment...
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'failed' && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
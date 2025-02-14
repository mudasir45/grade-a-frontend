'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentAPI } from '@/lib/api/payment'
import { CheckCircle, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentIntentId = searchParams.get('payment_intent')
        if (!paymentIntentId) throw new Error('No payment intent ID found')

        const result = await PaymentAPI.confirmPayment(paymentIntentId, {})
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Payment verification failed')
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' ? (
              'Verifying Payment...'
            ) : status === 'success' ? (
              <>
                <CheckCircle className="text-green-500" />
                Payment Successful
              </>
            ) : (
              <>
                <XCircle className="text-red-500" />
                Payment Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'error' && (
            <p className="text-red-500">{error}</p>
          )}
          <Button 
            className="w-full" 
            onClick={() => router.push('/buy4me')}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 
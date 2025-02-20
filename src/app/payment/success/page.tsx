'use client'

import { BizapayAPI } from '@/lib/api/bizapay'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    if (!paymentId) {
      router.push('/')
      return
    }

    const verifyPayment = async () => {
      try {
        const payment = await BizapayAPI.getPaymentStatus(paymentId)
        if (payment.status === 'completed') {
          // Redirect to order confirmation
          router.push(`/orders/${payment.orderId}/confirmation`)
        } else {
          // Handle other statuses
          router.push(`/orders/${payment.orderId}`)
        }
      } catch (error) {
        console.error('Payment verification failed:', error)
        router.push('/')
      }
    }

    verifyPayment()
  }, [paymentId])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1>Verifying Payment...</h1>
        <p>Please wait while we confirm your payment.</p>
      </div>
    </div>
  )
} 
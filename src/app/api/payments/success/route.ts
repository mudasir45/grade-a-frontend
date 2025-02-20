import { BizapayAPI } from '@/lib/api/bizapay'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const paymentId = url.searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }

  try {
    const payment = await BizapayAPI.getPaymentStatus(paymentId)
    
    if (payment.status === 'completed') {
      // Update order status in database
      await db.order.update({
        where: { id: payment.orderId },
        data: { 
          status: 'paid',
          paymentId: payment.id,
          paidAt: new Date()
        }
      })

      return NextResponse.redirect(new URL(`/payment/success?payment_id=${paymentId}`, req.url))
    } else {
      return NextResponse.redirect(new URL('/payment/error', req.url))
    }
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }
} 
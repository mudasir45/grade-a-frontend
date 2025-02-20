import { BizapayAPI } from '@/lib/api/bizapay'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { amount, currency, orderId, card } = await req.json()

    const payment = await BizapayAPI.createPayment({
      amount,
      currency,
      reference_id: orderId,
      description: `Card payment for order ${orderId}`,
      customer: {
        email: card.email || 'customer@example.com',
        name: card.name
      },
      paymentMethod: {
        type: 'card'
      },
      redirect: {
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`
      },
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bizapay`,
      metadata: {
        order_id: orderId,
        payment_type: 'card'
      }
    })

    return NextResponse.json({
      paymentUrl: payment.payment_url,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Card processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    )
  }
} 
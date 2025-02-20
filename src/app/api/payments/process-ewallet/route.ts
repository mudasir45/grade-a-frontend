import { BizapayAPI } from '@/lib/api/bizapay'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { amount, currency, orderId, walletType } = await req.json()

    const payment = await BizapayAPI.createPayment({
      amount,
      currency,
      orderId,
      description: `E-wallet payment for order ${orderId}`,
      customerEmail: 'customer@example.com',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bizapay`,
      paymentMethod: {
        type: 'ewallet',
        provider: walletType
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('E-wallet processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    )
  }
} 
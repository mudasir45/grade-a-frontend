import { BizapayAPI } from '@/lib/api/bizapay'
import { db } from '@/lib/db'
import { WebhookEvent } from '@/lib/types/payment'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-bizapay-signature') || ''
    const payload = await req.json()

    // Validate webhook signature
    if (!BizapayAPI.validateWebhook(payload, signature)) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    const event = payload as WebhookEvent

    // Handle different event types
    switch (event.type) {
      case 'payment.completed':
        await db.transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id: event.data.payment.orderId },
            data: { 
              status: 'paid',
              paymentId: event.data.payment.id,
              paidAt: new Date()
            }
          })
          
          // Create payment record
          await tx.payment.create({
            data: {
              id: event.data.payment.id,
              orderId: event.data.payment.orderId,
              amount: event.data.payment.amount,
              currency: event.data.payment.currency,
              status: 'completed',
              provider: 'bizapay'
            }
          })
        })
        break
      case 'payment.failed':
        await db.order.update({
          where: { id: event.data.payment.orderId },
          data: { status: 'payment_failed' }
        })
        break
      case 'payment.cancelled':
        await db.order.update({
          where: { id: event.data.payment.orderId },
          data: { status: 'payment_cancelled' }
        })
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new NextResponse('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
} 
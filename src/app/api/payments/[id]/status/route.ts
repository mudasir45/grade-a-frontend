import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(params.id);

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method_types: paymentIntent.payment_method_types,
    });
  } catch (error) {
    console.error('Payment Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
} 
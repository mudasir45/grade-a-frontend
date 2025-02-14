import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { payment_method_id, fpx_bank } = await req.json();

    const paymentIntent = await stripe.paymentIntents.update(params.id, {
      payment_method: payment_method_id,
      payment_method_options: fpx_bank
        ? {
            fpx: {
              bank: fpx_bank,
            },
          }
        : undefined,
    });

    return NextResponse.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Update Payment Method Error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
} 
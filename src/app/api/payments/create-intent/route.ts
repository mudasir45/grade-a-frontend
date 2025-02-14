import { formatStripeError, stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, currency, request_id } = await req.json();
    console.log('Received payment intent request:', { amount, currency, request_id });

    // Validate amount
    const numericAmount = Math.round(Number(amount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    // Validate currency
    const supportedCurrencies = ['myr', 'usd', 'sgd'];
    const normalizedCurrency = currency.toLowerCase();
    if (!supportedCurrencies.includes(normalizedCurrency)) {
      console.error('Invalid currency:', currency);
      return NextResponse.json(
        { error: 'Unsupported currency' },
        { status: 400 }
      );
    }

    // Validate request_id
    if (!request_id || typeof request_id !== 'string') {
      console.error('Invalid request_id:', request_id);
      return NextResponse.json(
        { error: 'Valid request ID is required' },
        { status: 400 }
      );
    }

    try {
      console.log('Creating Stripe payment intent with amount:', numericAmount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: numericAmount,
        currency: normalizedCurrency,
        payment_method_types: ['card'],
        metadata: {
          request_id,
        },
        description: `Buy4Me Order - ${request_id}`,
      });

      console.log('Payment intent created successfully:', paymentIntent.id);

      return NextResponse.json({
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
      });
    } catch (stripeError) {
      console.error('Stripe Error:', stripeError);
      return NextResponse.json(
        { error: formatStripeError(stripeError) },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: formatStripeError(error) },
      { status: 500 }
    );
  }
} 
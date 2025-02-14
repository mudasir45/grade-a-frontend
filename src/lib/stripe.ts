import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const formatStripeError = (error: any) => {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message;
  }
  return 'An unexpected error occurred';
}; 
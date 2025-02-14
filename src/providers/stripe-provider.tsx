'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ReactNode } from 'react'

if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_KEY is missing')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
  amount: number
  currency: string
}

export function StripeProvider({ children, clientSecret, amount, currency }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0f172a',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    loader: 'always' as const,
    paymentMethodConfiguration: {
      card: {
        display: 'accordion' as const
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
} 
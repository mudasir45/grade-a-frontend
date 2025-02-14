export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY!,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0f172a',
    },
  },
}

export const CURRENCY = {
  code: 'MYR',
  symbol: 'RM',
} 
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.ukcallcanter.com/api'

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

export const BIZAPAY_CONFIG = {
  apiKey: process.env.BIZAPAY_API_KEY!,
  category: process.env.BIZAPAY_CATEGORY!,
  auth: process.env.BIZAPAY_AUTH!,
}

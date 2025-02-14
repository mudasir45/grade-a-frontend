const API_KEY = 'dummy_key' // In production, use environment variable

export async function fetchExchangeRates(base: string = 'USD'): Promise<CurrencyRate[]> {
  // In a real implementation, this would call an actual currency API
  return [
    { code: 'USD', rate: 1 },
    { code: 'MYR', rate: 4.15 },
    { code: 'SGD', rate: 1.35 },
    { code: 'EUR', rate: 0.92 }
  ]
}

export function convertCurrency(amount: number, fromRate: number, toRate: number): number {
  return (amount / fromRate) * toRate
}
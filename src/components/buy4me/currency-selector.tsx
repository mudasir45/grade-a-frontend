'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchExchangeRates } from '@/lib/currency'
import type { CurrencyRate } from '@/lib/types'

interface CurrencySelectorProps {
  onCurrencyChange: (currency: string, rate: number) => void
}

export function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  useEffect(() => {
    async function loadRates() {
      const rates = await fetchExchangeRates()
      setCurrencies(rates)
    }
    loadRates()
  }, [])

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    const rate = currencies.find(c => c.code === currency)?.rate || 1
    onCurrencyChange(currency, rate)
  }

  return (
    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} ({currency.rate.toFixed(2)})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
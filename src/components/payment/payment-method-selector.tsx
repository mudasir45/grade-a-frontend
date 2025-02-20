'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PAYMENT_METHODS, PaymentMethod } from '@/lib/types/payment'
import Image from 'next/image'
import { useState } from 'react'

interface PaymentMethodSelectorProps {
  amount: number
  currency: string
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({
  amount,
  currency,
  onSelect
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>()

  // Filter methods by currency and amount limits
  const availableMethods = PAYMENT_METHODS.filter(method => {
    if (!method.enabled) return false
    if (!method.currencies.includes(currency)) return false
    if (method.minAmount && amount < method.minAmount) return false
    if (method.maxAmount && amount > method.maxAmount) return false
    return true
  })

  const handleSelect = (methodId: string) => {
    const method = availableMethods.find(m => m.id === methodId)
    if (method) {
      setSelectedMethod(methodId)
      onSelect(method)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={handleSelect}
          className="space-y-4"
        >
          {availableMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center space-x-4 rounded-lg border p-4 cursor-pointer hover:bg-accent"
              onClick={() => handleSelect(method.id)}
            >
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex flex-1 items-center space-x-4">
                <Image
                  src={method.logo}
                  alt={method.name}
                  width={48}
                  height={32}
                  className="object-contain"
                />
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
} 
'use client'

import { PaymentMethod } from '@/lib/types/payment'
import { useState } from 'react'
import { FPXPaymentForm } from './fpx-payment-form'
import { PaymentMethodSelector } from './payment-method-selector'
import { CardPaymentForm } from './card-payment-form'
import { EWalletPaymentForm } from './ewallet-payment-form'

interface UnifiedPaymentFormProps {
  amount: number
  currency: string
  orderId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function UnifiedPaymentForm({
  amount,
  currency,
  orderId,
  onSuccess,
  onCancel
}: UnifiedPaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>()

  const renderPaymentForm = () => {
    if (!selectedMethod) return null

    switch (selectedMethod.type) {
      case 'card':
        return (
          <CardPaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )
      case 'fpx':
        return (
          <FPXPaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )
      case 'ewallet':
        return (
          <EWalletPaymentForm
            method={selectedMethod}
            amount={amount}
            currency={currency}
            orderId={orderId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <PaymentMethodSelector
        amount={amount}
        currency={currency}
        onSelect={setSelectedMethod}
      />
      {renderPaymentForm()}
    </div>
  )
} 
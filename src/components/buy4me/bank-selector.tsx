'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FPX_BANKS } from '@/lib/payment-data'
import Image from 'next/image'
import { useState } from 'react'

interface BankSelectorProps {
  onSelect: (bankCode: string) => void
}

export function BankSelector({ onSelect }: BankSelectorProps) {
  const [selectedBank, setSelectedBank] = useState<string>('')

  const handleBankChange = (value: string) => {
    setSelectedBank(value)
    onSelect(value)
  }

  return (
    <RadioGroup
      value={selectedBank}
      onValueChange={handleBankChange}
      className="grid grid-cols-1 gap-4"
    >
      {FPX_BANKS.filter(bank => bank.active).map((bank) => (
        <Label
          key={bank.id}
          className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:border-primary ${
            selectedBank === bank.code ? 'border-primary bg-primary/5' : ''
          }`}
        >
          <RadioGroupItem value={bank.code} id={bank.code} />
          <div className="flex items-center space-x-3 flex-1">
            <Image
              src={bank.logo}
              alt={bank.name}
              width={32}
              height={32}
              className="object-contain"
            />
            <span>{bank.name}</span>
          </div>
        </Label>
      ))}
    </RadioGroup>
  )
} 
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useShipping } from '@/hooks/use-shipping'
import { countries } from '@/lib/shipping-data'

const shippingMethods = [
  { id: 'economy', name: 'Economy', icon: '🚢', tooltip: '15-20 business days' },
  { id: 'regular', name: 'Regular', icon: '✈️', tooltip: '7-10 business days' },
  { id: 'express', name: 'Express', icon: '⚡', tooltip: '3-5 business days' },
]

export function ShippingCalculator() {
  const { toast } = useToast()
  const { calculateShipping, loading, error } = useShipping()
  const [fromCountry, setFromCountry] = useState('')
  const [toCountry, setToCountry] = useState('')
  const [weight, setWeight] = useState('')
  const [method, setMethod] = useState<'economy' | 'regular' | 'express'>('regular')
  const [result, setResult] = useState<{ price: number; currency: string } | null>(null)

  const handleCalculate = async () => {
    try {
      if (!fromCountry || !toCountry || !weight || !method) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all fields to calculate shipping.',
          variant: 'destructive',
        })
        return
      }

      const weightNum = parseFloat(weight)
      if (isNaN(weightNum) || weightNum <= 0) {
        toast({
          title: 'Invalid Weight',
          description: 'Please enter a valid weight greater than 0.',
          variant: 'destructive',
        })
        return
      }

      const calculation = await calculateShipping(
        fromCountry,
        toCountry,
        weightNum,
        method
      )

      setResult({
        price: calculation.price,
        currency: calculation.currency,
      })

      toast({
        title: 'Calculation Complete',
        description: 'Your shipping rate has been calculated.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to calculate shipping rate.',
        variant: 'destructive',
      })
    }
  }

  return (
    <section className="py-24 bg-white" id="calculator">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                Shipping Calculator
              </h2>
              <p className="text-lg text-gray-600">
                Get an instant quote for your shipment
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Country
                  </label>
                  <Select onValueChange={setFromCountry} value={fromCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Country
                  </label>
                  <Select onValueChange={setToCountry} value={toCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Weight (kg)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum weight: 0.1 kg</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {shippingMethods.map((shippingMethod) => (
                    <TooltipProvider key={shippingMethod.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={method === shippingMethod.id ? "default" : "outline"}
                            className="w-full justify-start gap-2"
                            onClick={() => setMethod(shippingMethod.id as 'economy' | 'regular' | 'express')}
                          >
                            <span>{shippingMethod.icon}</span>
                            <span>{shippingMethod.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{shippingMethod.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCalculate}
                disabled={loading || !fromCountry || !toCountry || !weight || !method}
              >
                <Calculator className="mr-2 h-4 w-4" />
                {loading ? 'Calculating...' : 'Calculate Shipping'}
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <h3 className="text-2xl font-bold text-gray-900">
                    Estimated Cost: {result.currency} {result.price.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Final price may vary based on package dimensions and special handling requirements
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
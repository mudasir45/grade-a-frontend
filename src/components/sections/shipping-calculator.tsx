'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import useShippingData from '@/hooks/use-shipping-data'
import { useToast } from '@/hooks/use-toast'
import { ShippingAPI } from '@/lib/api/shipping'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertCircle, Calculator, Info, Loader2, Package, Plane, Ship, Truck } from 'lucide-react'
import { useState } from 'react'

const serviceIcons = {
  'economy': <Ship className="h-5 w-5" />,
  'regular': <Truck className="h-5 w-5" />,
  'express': <Plane className="h-5 w-5" />
}

export function ShippingCalculator() {
  const { toast } = useToast()
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    isLoading: dataLoading,
    error: dataError,
    refetch
  } = useShippingData()

  const [formData, setFormData] = useState({
    fromCountry: '',
    toCountry: '',
    weight: '',
    method: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ price: number; currency: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fromCountry) {
      errors.fromCountry = 'Please select origin country'
    }
    if (!formData.toCountry) {
      errors.toCountry = 'Please select destination country'
    }
    if (!formData.weight) {
      errors.weight = 'Please enter package weight'
    } else {
      const weightNum = parseFloat(formData.weight)
      if (isNaN(weightNum) || weightNum <= 0) {
        errors.weight = 'Weight must be greater than 0'
      }
      if (weightNum > 1000) {
        errors.weight = 'Weight cannot exceed 1000 kg'
      }
    }
    if (!formData.method) {
      errors.method = 'Please select shipping method'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const rate = await ShippingAPI.calculateRate({
        origin_country: formData.fromCountry,
        destination_country: formData.toCountry,
        weight: parseFloat(formData.weight),
        length: 0,
        width: 0,
        height: 0,
        service_type: formData.method,
      })

      setResult({
        price: rate.cost_breakdown.total_cost,
        currency: "MYR"
      })

      toast({
        title: 'Rate Calculated',
        description: 'Your shipping rate has been calculated successfully.',
      })
    } catch (err) {
      console.error('Calculation error:', err)
      toast({
        title: 'Calculation Error',
        description: err instanceof Error ? err.message : 'Failed to calculate shipping rate.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading shipping data...</p>
        </div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive">Error loading shipping data</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="py-24 bg-gray-50 text-gray-900" id="calculator">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Shipping Rate Calculator
            </h2>
            <p className="text-lg text-gray-600">
              Get instant shipping quotes for your international deliveries
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="backdrop-blur-sm bg-white/90">
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        From Country
                      </label>
                      <Select
                        value={formData.fromCountry}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fromCountry: value }))}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          formErrors.fromCountry && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {departureCountries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              <span className="flex items-center gap-2">
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.fromCountry && (
                        <p className="text-sm text-red-500">{formErrors.fromCountry}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        To Country
                      </label>
                      <Select
                        value={formData.toCountry}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, toCountry: value }))}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          formErrors.toCountry && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinationCountries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              <span className="flex items-center gap-2">
                                <span>{country.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.toCountry && (
                        <p className="text-sm text-red-500">{formErrors.toCountry}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Package Weight
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter weight in kilograms (kg)</p>
                            <p>Maximum weight: 1000 kg</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="Enter weight in kg"
                        className={cn(
                          formErrors.weight && "border-red-500"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        kg
                      </span>
                    </div>
                    {formErrors.weight && (
                      <p className="text-sm text-red-500">{formErrors.weight}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Shipping Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {serviceTypes.map((service) => (
                        <TooltipProvider key={service.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={formData.method === service.id ? "default" : "outline"}
                                className={cn(
                                  "w-full justify-start gap-2",
                                  formData.method === service.id && "border-2 border-gray-300 bg-gray-900 text-white hover:bg-gray-900"
                                )}
                                onClick={() => setFormData(prev => ({ ...prev, method: service.id }))}
                              >
                                {serviceIcons[service.id as keyof typeof serviceIcons]}
                                <span>{service.name}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{service.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                    {formErrors.method && (
                      <p className="text-sm text-red-500">{formErrors.method}</p>
                    )}
                  </div>

                  <Button
                    className="w-full border-2 border-gray-900"
                    size="lg"
                    onClick={handleCalculate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate Shipping Rate
                      </>
                    )}
                  </Button>

                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-primary/5 p-6 text-center text-gray-900"
                    >
                      <Package className="h-8 w-8 mx-auto mb-4 " />
                      <h3 className="text-2xl font-bold  mb-2">
                        Estimated Cost: {result.currency} {result.price.toFixed(2)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        * Final price may vary based on actual weight, dimensions, and special handling requirements
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
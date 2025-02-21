'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useShippingData from '@/hooks/use-shipping-data'
import { useToast } from '@/hooks/use-toast'
import { ShippingAPI } from '@/lib/api/shipping'
import type { ShipmentRequest, ShippingRate } from '@/lib/types/shipping'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Package } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import PaymentForm from '../payment/payment-gateway'
import { ShippingSuccess } from './shipping-success'

interface FormErrors {
  sender: string[]
  recipient: string[]
  package: string[]
}

export function ShipmentForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    shippingZones,
    isLoading,
    error: dataError,
    refetch
  } = useShippingData();

  // Set default service type from the first available service
  const defaultServiceType = serviceTypes[0]?.id

  const [formData, setFormData] = useState<ShipmentRequest>({
    sender_name: '',    
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    sender_country: '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    recipient_country: '',
    package_type: '',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    description: '',
    declared_value: 0,
    service_type: "",
    insurance_required: false,
    signature_required: false
  })

  const defaultFormData = {
    sender_name: '',    
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    sender_country: '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    recipient_country: '',
    package_type: '',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    description: '',
    declared_value: 0,
    service_type: "",
    insurance_required: false,
    signature_required: false
  }

  const [successData, setSuccessData] = useState<{
    tracking_number: string
    total_cost: number
    service_type: string
    // sender_name: string
    // recipient_name: string
    sender_country: string
    recipient_country: string
  } | null>(null)

  // Required fields for rate calculation
  const requiredFields = [
    'sender_country',
    'recipient_country',
    'weight',
    'length',
    'width',
    'height'
  ] as const

  // Check if all required fields are filled and service type is selected
  const canCalculateRate = useCallback(() => {
    // First check if basic dimensions and locations are filled
    const hasRequiredFields = requiredFields.every(field => {
      const value = formData[field]
      if (typeof value === 'number') {
        return value > 0
      }
      return Boolean(value)
    })

    // Then check if service type is selected
    return hasRequiredFields && Boolean(formData.service_type)
  }, [formData])

  // Show guidance message when fields are filled but service type isn't
  const showServiceTypePrompt = useCallback(() => {
    const hasRequiredFields = requiredFields.every(field => {
      const value = formData[field]
      if (typeof value === 'number') {
        return value > 0
      }
      return Boolean(value)
    })

    return hasRequiredFields && !formData.service_type
  }, [formData])

  // Calculate shipping rate when relevant fields change
  useEffect(() => {
    const calculateShippingRate = async () => {
      // Check if we have all required fields
      const hasRequiredFields = requiredFields.every(field => {
        const value = formData[field]
        if (typeof value === 'number') {
          return value > 0
        }
        return Boolean(value)
      })

      // If we don't have all required fields, don't do anything
      if (!hasRequiredFields) return

      // If we don't have service type, show guidance
      if (!formData.service_type) {
        toast({
          title: 'Service Type Required',
          description: 'Please select a service type to see shipping rates.',
        })
        return
      }

      setCalculating(true)
      setShippingRate(null)

      try {
        const rate = await ShippingAPI.calculateRate({
          origin_country: formData.sender_country,
          destination_country: formData.recipient_country,
          weight: formData.weight,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          service_type: formData.service_type,
          declared_value: formData.declared_value || 0,
          insurance_required: formData.insurance_required || false
        })

        setShippingRate(rate)
      } catch (error) {
        console.error('Rate calculation error:', error)
        toast({
          title: 'Rate Calculation Failed',
          description: error instanceof Error 
            ? error.message 
            : 'Failed to calculate shipping rate. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setCalculating(false)
      }
    }

    // Debounce the calculation to prevent too many API calls
    const timeoutId = setTimeout(calculateShippingRate, 500)
    return () => clearTimeout(timeoutId)
  }, [...requiredFields.map(field => formData[field]), formData.service_type])

  // Validate required fields before proceeding to payment
  const validateRequiredFields = () => {
    const requiredFormFields = [
      'sender_name',
      'sender_email',
      'sender_phone',
      'sender_address',
      'sender_country',
      'recipient_name',
      'recipient_email',
      'recipient_phone',
      'recipient_address',
      'recipient_country',
      'package_type',
      'weight',
      'length',
      'width',
      'height',
      'service_type'
    ]

    const missingFields = requiredFormFields
      .filter(key => {
        const value = formData[key as keyof ShipmentRequest]
        if (typeof value === 'number') {
          return value <= 0
        }
        return !value
      })
      .map(key => key.replace(/_/g, ' '))

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleProceedToPayment = () => {
    if (!shippingRate) {
      toast({
        title: 'No Shipping Rate',
        description: 'Please wait for the shipping rate calculation to complete.',
        variant: 'destructive',
      })
      return
    }

    if (!validateRequiredFields()) {
      return
    }

    setShowPayment(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!shippingRate) {
      toast({
        title: 'Missing Shipping Rate',
        description: 'Please wait for the shipping rate calculation to complete.',
        variant: 'destructive'
      })
      return
    }

    handleProceedToPayment()
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    setLoading(true)

    try {
      // Create shipment after successful payment
      const shipment = await ShippingAPI.createShipment({
        ...formData,
        // payment_id: transactionId
      })

      setShowSuccess(true)
      setSuccessData({
        tracking_number: shipment.tracking_number,
        total_cost: shippingRate?.cost_breakdown.total_cost || 0,
        service_type: formData.service_type,
        sender_country: formData.sender_country,
        recipient_country: formData.recipient_country
      })

      // Reset form
      setFormData(defaultFormData)
      setStep(1)
      setShippingRate(null)
      setShowPayment(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to create shipment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const [errors, setErrors] = useState<FormErrors>({
    sender: [],
    recipient: [],
    package: []
  })

  // Validation functions for each step
  const validateSenderDetails = (): boolean => {
    const newErrors: string[] = []
    
    if (!formData.sender_name.trim()) newErrors.push('Sender name is required')
    if (!formData.sender_email.trim()) newErrors.push('Sender email is required')
    if (!formData.sender_phone.trim()) newErrors.push('Sender phone is required')
    if (!formData.sender_address.trim()) newErrors.push('Sender address is required')
    if (!formData.sender_country) newErrors.push('Sender country is required')

    setErrors(prev => ({ ...prev, sender: newErrors }))
    return newErrors.length === 0
  }

  const validateRecipientDetails = (): boolean => {
    const newErrors: string[] = []
    
    if (!formData.recipient_name.trim()) newErrors.push('Recipient name is required')
    if (!formData.recipient_email.trim()) newErrors.push('Recipient email is required')
    if (!formData.recipient_phone.trim()) newErrors.push('Recipient phone is required')
    if (!formData.recipient_address.trim()) newErrors.push('Recipient address is required')
    if (!formData.recipient_country) newErrors.push('Recipient country is required')

    setErrors(prev => ({ ...prev, recipient: newErrors }))
    return newErrors.length === 0
  }

  const validatePackageDetails = (): boolean => {
    const newErrors: string[] = []
    
    if (!formData.package_type) newErrors.push('Package type is required')
    if (!formData.weight || formData.weight <= 0) newErrors.push('Valid weight is required')
    if (!formData.length || formData.length <= 0) newErrors.push('Valid length is required')
    if (!formData.width || formData.width <= 0) newErrors.push('Valid width is required')
    if (!formData.height || formData.height <= 0) newErrors.push('Valid height is required')
    if (!formData.description.trim()) newErrors.push('Package description is required')
    if (!formData.service_type) newErrors.push('Service type is required')

    setErrors(prev => ({ ...prev, package: newErrors }))
    return newErrors.length === 0
  }

  const handleNextStep = () => {
    let isValid = false
    
    switch (step) {
      case 1:
        isValid = validateSenderDetails()
        break
      case 2:
        isValid = validateRecipientDetails()
        break
      case 3:
        isValid = validatePackageDetails()
        break
    }

    if (isValid) {
      setStep(prev => prev + 1)
      // Clear errors for next step
      setErrors(prev => ({ ...prev, [Object.keys(errors)[step - 1]]: [] }))
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive'
      })
    }
  }

  // Render error messages
  const renderErrors = (stepErrors: string[]) => {
    if (stepErrors.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 text-red-600 p-4 rounded-lg mb-4"
      >
        <ul className="list-disc list-inside space-y-1">
          {stepErrors.map((error, index) => (
            <li key={index} className="text-sm">{error}</li>
          ))}
        </ul>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading shipping data: {dataError.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (showPayment && shippingRate) {
    return (
      <PaymentForm
        amount={shippingRate.cost_breakdown.total_cost.toString()}
        shippingAddress={formData.sender_address}
        paymentType="shipping"
        metadata={{
          requestType: 'shipping',
          shipmentData: formData
        }}
      />
    )
  }

  if (showSuccess && successData) {
    return <ShippingSuccess shipment={successData} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
              <CardDescription>
                Enter the sender's contact and address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderErrors(errors.sender)}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Full Name</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sender_email">Email</Label>
                  <Input
                    id="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_phone">Phone</Label>
                  <Input
                    id="sender_phone"
                    value={formData.sender_phone}
                    onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_country">Country</Label>
                  <Select
                    value={formData.sender_country}
                    onValueChange={(value) => setFormData({ ...formData, sender_country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {departureCountries.map((country) => (
                        <SelectItem key={country.code} value={country.id}>
                          <span className="flex items-center gap-2">
                            {/* <span>{country.flag}</span> */}
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sender_address">Address</Label>
                  <Textarea
                    id="sender_address"
                    value={formData.sender_address}
                    onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={handleNextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recipient Information</CardTitle>
              <CardDescription>
                Enter the recipient's contact and address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderErrors(errors.recipient)}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Full Name</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Email</Label>
                  <Input
                    id="recipient_email"
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_phone">Phone</Label>
                  <Input
                    id="recipient_phone"
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_country">Country</Label>
                  <Select
                    value={formData.recipient_country}
                    onValueChange={(value) => setFormData({ ...formData, recipient_country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationCountries.map((country) => (
                        <SelectItem key={country.code} value={country.id}>
                          <span className="flex items-center gap-2">
                            {/* <span>{country.flag}</span> */}
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recipient_address">Address</Label>
                  <Textarea
                    id="recipient_address"
                    value={formData.recipient_address}
                    onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleNextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Provide information about your package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderErrors(errors.package)}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="package_type">Package Type</Label>
                  <Select
                    value={formData.package_type}
                    onValueChange={(value) => setFormData({ ...formData, package_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { id: 'document', name: 'Document' },
                        { id: 'parcel', name: 'Parcel' }, 
                        { id: 'box', name: 'Box' },
                        { id: 'pallet', name: 'Pallet' }
                      ].map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Length"
                      type="number"
                      min="1"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
                      required
                    />
                    <Input
                      placeholder="Width"
                      type="number"
                      min="1"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                      required
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      min="1"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="declared_value">Declared Value (USD)</Label>
                  <Input
                    id="declared_value"
                    type="number"
                    min="0"
                    value={formData.declared_value}
                    onChange={(e) => setFormData({ ...formData, declared_value: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                    
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insurance_required"
                      checked={formData.insurance_required}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, insurance_required: checked as boolean })
                      }
                    />
                    <Label htmlFor="insurance_required" className="text-sm text-muted-foreground">
                      Add Insurance (Optional)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signature_required"
                      checked={formData.signature_required}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, signature_required: checked as boolean })
                      }
                    />
                    <Label htmlFor="signature_required" className="text-sm text-muted-foreground">
                      Require Signature (Optional)
                    </Label>
                  </div>
                </div>
              </div>

              {shippingRate && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Shipping Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <span>${shippingRate.rate_details.base_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight Charge:</span>
                      <span>${shippingRate.rate_details.weight_charge}</span>
                    </div>
               
                    <div className="flex justify-between">
                      <span>Service Charge:</span>
                      <span>${shippingRate.cost_breakdown.service_price}</span>
                    </div>
              
                    { shippingRate.cost_breakdown.additional_charges.map(charge => (
                      <div className="flex justify-between">
                        <span>{charge.name}:</span>
                        <span>${charge.amount}</span>
                      </div>
                    ))}
                
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${shippingRate.cost_breakdown.total_cost}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" disabled={loading || !shippingRate} onClick={handleProceedToPayment}>
                {loading ? (
                  'Creating Shipment...'
                ) : (
                  <>
                    Create Shipment
                    <Package className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </form>
  )
}
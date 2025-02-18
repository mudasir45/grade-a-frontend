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
import { packageTypes } from '@/lib/shipping-data'
import type { ShipmentRequest, ShippingRate } from '@/lib/types/shipping'
import { motion } from 'framer-motion'
import { ArrowRight, Package } from 'lucide-react'
import { useEffect, useState } from 'react'



export function ShipmentForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null)
  const [calculating, setCalculating] = useState(false)
  const {
    departureCountries,
    destinationCountries,
    serviceTypes,
    shippingZones,
    isLoading,
    error,
    refetch
  } = useShippingData();

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
    service_type: 'standard',
    insurance_required: false,
    signature_required: false
  })

  // Calculate shipping rate when relevant fields change
  useEffect(() => {
    const calculateShippingRate = async () => {
      if (
        formData.sender_country &&
        formData.recipient_country &&
        formData.service_type &&
        formData.weight > 0 &&
        formData.length > 0 &&
        formData.width > 0 &&
        formData.height > 0
      ) {
        setCalculating(true)
        try {
          const rate = await ShippingAPI.calculateRate({
            origin_country: formData.sender_country,
            destination_country: formData.recipient_country,
            weight: formData.weight,
            length: formData.length,
            width: formData.width,
            height: formData.height,
            service_type: formData.service_type,
            declared_value: formData.declared_value,
            insurance_required: formData.insurance_required
          })
          console.log(rate)
          setShippingRate(rate)
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to calculate shipping rate',
            variant: 'destructive'
          })
        } finally {
          setCalculating(false)
        }
      }
    }

    calculateShippingRate()
    console.log(formData)
  }, [
    formData.sender_country,
    formData.recipient_country,
    formData.weight,
    formData.length,
    formData.width,
    formData.height,
    formData.service_type,
    formData.declared_value,
    formData.insurance_required
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const shipment = await ShippingAPI.createShipment(formData as ShipmentRequest)
      
      toast({
        title: 'Shipment Created',
        description: `Tracking number: ${shipment.tracking_number}`,
      })
      
      // Reset form
      setFormData({
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
        service_type: 'standard',
        insurance_required: false,
        signature_required: false
      })
      setStep(1)
      setShippingRate(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create shipment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
                <Button type="button" onClick={() => setStep(2)}>
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
                <Button type="button" onClick={() => setStep(3)}>
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
                      {packageTypes.map((type) => (
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
                    <Label htmlFor="insurance_required">Add Insurance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signature_required"
                      checked={formData.signature_required}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, signature_required: checked as boolean })
                      }
                    />
                    <Label htmlFor="signature_required">Require Signature</Label>
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
                    {/* {shippingRate.cost_breakdown.additional_charges.length > 0 && (
                      <div className="flex justify-between">
                        <span>Dimensional Charge:</span>
                        <span>${shippingRate.cost_breakdown.additional_charges[0].amount}</span>
                      </div>
                    )} */}
                    {/* <div className="flex justify-between">
                      <span>Zone Charge:</span>
                      <span>${shippingRate.cost_breakdown.additional_charges[1].amount}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span>Service Charge:</span>
                      <span>${shippingRate.cost_breakdown.service_price}</span>
                    </div>
                    {/* {shippingRate.cost_breakdown.additional_charges.length > 0 && (
                      <div className="flex justify-between">
                        <span>Insurance:</span>
                        <span>${shippingRate.cost_breakdown.additional_charges[2].amount}</span>
                      </div>
                    )} */}
                    { shippingRate.cost_breakdown.additional_charges.map(charge => (
                      <div className="flex justify-between">
                        <span>{charge.name}:</span>
                        <span>${charge.amount}</span>
                      </div>
                    ))}
                    {/* <div className="flex justify-between">
                      <span>Fuel Surcharge:</span>
                      <span>${shippingRate.cost_breakdown.additional_charges[0].amount}</span>
                    </div> */}
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
              <Button type="submit" disabled={loading || !shippingRate}>
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
'use client'

import { useToast } from '@/hooks/use-toast'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import useShippingData from '@/hooks/use-shipping-data'
export function ShipmentForm() {
    const { toast } = useToast()
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
    const [searchCustomer, setSearchCustomer] = useState('')
    const [formData, setFormData] = useState({
        senderName: '',
        senderNumber: '',
        senderCity: '',
        senderAddress: '',
        receiverName: '',
        receiverNumber: '',
        receiverCity: '',
        receiverAddress: '',
        package_type: '',
        weight: 0,
        baseRate: '',
        packagingRM: '',
        length: 0,
        width: 0,
        height: 0,
        description: '',
        declared_value: 0,
        service_type: "",
        insurance_required: false,
        signature_required: false,
        deliveryRM: '',
        totalBillRM: '',
        totalBillNaira: '',
        additionalCharges: {
            foodStuff: false,
            creams: false,
            traditionalItems: false,
            electronics: false,
            documents: false,
            medications: false
        },
    })

    const additionalCharges = [
        { id: "food", label: "Food stuff" },
        { id: "creams", label: "Creams, human" },
        { id: "traditional", label: "Traditional Items" },
        { id: "electronics", label: "Passport, Electronics" },
        { id: "documents", label: "Driver license, documents" },
        { id: "medications", label: "Medications" },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission logic here
        toast({
            title: 'Shipment Created',
            description: 'The shipment has been successfully created.',
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 flex">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">Create New Shipment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Customer Search */}
                    <div className="flex gap-4 flex-col sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="customer-search">Search customer</Label>
                            <Select>
                                <SelectTrigger id="search-customer">
                                    <SelectValue placeholder="Search customer by phone number" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0318">0318</SelectItem>
                                    <SelectItem value="0317">0317</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="secondary">Create New Customer</Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sender Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Sender Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="sender-name">Sender Name</Label>
                                <Input id="sender-name" placeholder="Enter sender name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-number">Sender Number</Label>
                                <Input id="sender-number" type="tel" placeholder="Enter phone number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-city">Sender City</Label>
                                <Select>
                                    <SelectTrigger id="sender-city">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="city1">City One</SelectItem>
                                        <SelectItem value="city2">City Two</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-address">Sender Address</Label>
                                <Textarea id="sender-address" placeholder="Enter complete address" />
                            </div>
                        </div>

                        {/* Receiver Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Receiver Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-name">Receiver Name</Label>
                                <Input id="receiver-name" placeholder="Enter receiver name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-number">Receiver Number</Label>
                                <Input id="receiver-number" type="tel" placeholder="Enter phone number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-city">Receiver City</Label>
                                <Select>
                                    <SelectTrigger id="receiver-city">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="city1">City One</SelectItem>
                                        <SelectItem value="city2">City Two</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-address">Receiver Address</Label>
                                <Textarea id="receiver-address" placeholder="Enter complete address" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parcel Details */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Parcel Details</h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="package_type">Package Type</Label>
                                <Select
                                    value={formData.package_type}
                                    onValueChange={(value) => setFormData({ ...formData, package_type: value })}
                                >
                                    <SelectTrigger className="w-full">
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
                                <Input id="weight" type="number" placeholder="Enter weight" />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label>Dimensions (cm)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <Input
                                            placeholder="Length"
                                            type="number"
                                            min="1"
                                            value={formData.length}
                                            onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
                                            className="w-full"
                                            required
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Length</span>
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Width"
                                            type="number"
                                            min="1"
                                            value={formData.width}
                                            onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                                            className="w-full"
                                            required
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Width</span>
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Height"
                                            type="number"
                                            min="1"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                            className="w-full"
                                            required
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Height</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="base-rate">Base Rate</Label>
                                <Select>
                                    <SelectTrigger id="base-rate">
                                        <SelectValue placeholder="Select base rate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="17">17</SelectItem>
                                        <SelectItem value="19">19</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="packaging">packaging (RM)</Label>
                                <Input id="packaging" type="number" placeholder="Enter the cost of packing" />
                            </div>
                            <div className="space-y-2">
                  <Label htmlFor="declared_value">Declared Value (USD)</Label>
                  <Input
                    id="declared_value"
                    type="number"
                    min="0"
                    value={formData.declared_value}
                    onChange={(e) => setFormData({ ...formData, declared_value: parseFloat(e.target.value) })}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                  >
                    <SelectTrigger className="w-full">
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

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                        </div>
                    </div>

                    {/* Additional Charges */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Additional Charges</h3>
                        <div className="grid gap-2">
                            {additionalCharges.map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox id={item.id} />
                                    <Label htmlFor={item.id}>{item.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Bill */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="total-rm">Delivery(RM)</Label>
                                <Input id="total-rm" type="number" readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total-rm">Total Bill (RM)</Label>
                                <Input id="total-rm" type="number" readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total-naira">Total Bill (Naira)</Label>
                                <Input id="total-naira" type="number" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* optional checkbox */}
                    <div className="sm:col-span-2 space-y-4">
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

                    {/* send bill */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Send Bill To</h3>
                        <RadioGroup defaultValue="whatsapp" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="whatsapp" id="whatsapp" />
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sms" id="sms" />
                                <Label htmlFor="sms">SMS</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <Button type="button" variant="outline">Print AWB</Button>
                        <Button type="submit">Create Shipment</Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
} 
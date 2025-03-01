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
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { z } from 'zod'

interface FormErrors {
    sender: string[]
    recipient: string[]
    package: string[]
}

interface FieldError {
    field: string
    message: string
}

// Validation schemas
const emailSchema = z.string().email('Invalid email address')
const phoneSchema = z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    'Phone number must be in international format (e.g., +1234567890)'
)

export function ShipmentForm() {
    const { toast } = useToast()
    const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])
    const [errors, setErrors] = useState<FormErrors>({
        sender: [],
        recipient: [],
        package: []
    })
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
        sender_name: '',
        sender_phone: '',
        sender_email: '',
        sender_country: '',
        sender_address: '',
        receiver_name: '',
        receiver_phone: '',
        receiver_email: '',
        receiver_country: '',
        receiver_address: '',
        package_type: '',
        weight: 0,
        base_rate: '',
        length: 0,
        width: 0,
        height: 0,
        description: '',
        declared_value: 0,
        service_type: defaultServiceType || "",
        insurance_required: false,      
        signature_required: false,
        packagingRM:0,
        deliveryRM: 0,
        totalBillRM: 0,
        totalBillNaira: 0,
        sendBillVia: 'whatsapp',
        additional_charges: {
            food: false,
            creams: false,
            traditional: false,
            electronics: false,
            documents: false,
            medications: false
        },
    })

    const additional_charges = [
        { id: "food", label: "Food stuff" },
        { id: "creams", label: "Creams, human" },
        { id: "traditional", label: "Traditional Items" },
        { id: "electronics", label: "Passport, Electronics" },
        { id: "documents", label: "Driver license, documents" },
        { id: "medications", label: "Medications" },
    ]

    // Handle field change with validation
    const handleFieldChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        if (typeof value === 'string' && (field.includes('email') || field.includes('phone'))) {
            const error = validateField(field, value)
            if (error) {
                setFieldErrors(prev => [
                    ...prev.filter(e => e.field !== field),
                    { field, message: error }
                ])
            } else {
                setFieldErrors(prev => prev.filter(e => e.field !== field))
            }
        }
    }

    // Get error message for a field
    const getFieldError = (field: string): string | undefined => {
        return fieldErrors.find(e => e.field === field)?.message
    }

    // Validate field
    const validateField = (field: string, value: string): string | null => {
        try {
            switch (field) {
                case 'sender_email':
                case 'receiver_email':
                    emailSchema.parse(value)
                    return null
                case 'sender_phone':
                case 'receiver_phone':
                    phoneSchema.parse(value)
                    return null
                default:
                    return null
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.errors[0].message
            }
            return 'Invalid input'
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(formData)
        // Validate all fields before submission
        const senderErrors: string[] = []
        const recipientErrors: string[] = []
        const packageErrors: string[] = []

        // Validate sender details
        if (!formData.sender_name) senderErrors.push('Sender name is required')
        if (!formData.sender_phone) senderErrors.push('Sender phone number is required')
        const senderEmailError = validateField('sender_email', formData.sender_email)
        if (senderEmailError) senderErrors.push(senderEmailError)
        if (!formData.sender_country) senderErrors.push('Sender Country is required')
        if (!formData.sender_address) senderErrors.push('Sender address is required')

        // Validate recipient details
        if (!formData.receiver_name) recipientErrors.push('Recipient name is required')
        if (!formData.receiver_phone) recipientErrors.push('Recipient phone number is required')
        const receiverEmailError = validateField('receiver_email', formData.receiver_email)
        if (receiverEmailError) recipientErrors.push(receiverEmailError)
        if (!formData.receiver_country) recipientErrors.push('Recipient city is required')
        if (!formData.receiver_address) recipientErrors.push('Recipient address is required')

        // Validate package details
        if (!formData.package_type) packageErrors.push('Package type is required')
        if (!formData.weight || formData.weight <= 0) packageErrors.push('Valid weight is required')
        if (!formData.length || formData.length <= 0) packageErrors.push('Valid length is required')
        if (!formData.width || formData.width <= 0) packageErrors.push('Valid width is required')
        if (!formData.height || formData.height <= 0) packageErrors.push('Valid height is required')
        if (!formData.description) packageErrors.push('Package description is required')

        setErrors({
            sender: senderErrors,
            recipient: recipientErrors,
            package: packageErrors
        })

        if (senderErrors.length > 0 || recipientErrors.length > 0 || packageErrors.length > 0) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields correctly.',
                variant: 'destructive'
            })
            return
        }

       
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
                            <Select value={searchCustomer} onValueChange={setSearchCustomer}>
                                <SelectTrigger id="search-customer">
                                    <SelectValue placeholder="Search customer by phone number" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="923180522996">03180522996</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type='button' variant="secondary">Create New Customer</Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-8">
                        {/* Sender Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Sender Details</h3>
                            {renderErrors(errors.sender)}
                            <div className="space-y-2">
                                <Label htmlFor="sender-name">Sender Name</Label>
                                <Input
                                    id="sender-name"
                                    placeholder="Enter sender name"
                                    value={formData.sender_name}
                                    onChange={(e) => handleFieldChange('sender_name', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('sender_name') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('sender_name') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('sender_name')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-number">Sender Phone</Label>
                                <Input
                                    id="sender-number"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={formData.sender_phone}
                                    onChange={(e) => handleFieldChange('sender_phone', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('sender_phone') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('sender_phone') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('sender_phone')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-email">Sender Email</Label>
                                <Input
                                    id="sender-email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={formData.sender_email}
                                    onChange={(e) => handleFieldChange('sender_email', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('sender_email') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('sender_email') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('sender_email')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-city">Sender Country</Label>
                                <Select
                                    value={formData.sender_country}
                                    onValueChange={(value) => setFormData({ ...formData, sender_country: value })}
                                >
                                    <SelectTrigger id="sender-city">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departureCountries.map((country) => (
                                            <SelectItem key={country.code} value={country.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{country.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-address">Sender Address</Label>
                                <Textarea
                                    id="sender-address"
                                    placeholder="Enter complete address"
                                    value={formData.sender_address}
                                    onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Receiver Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Receiver Details</h3>
                            {renderErrors(errors.recipient)}
                            <div className="space-y-2">
                                <Label htmlFor="receiver-name">Receiver Name</Label>
                                <Input
                                    id="receiver-name"
                                    placeholder="Enter receiver name"
                                    value={formData.receiver_name}
                                    onChange={(e) => handleFieldChange('receiver_name', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('receiver_name') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('receiver_name') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('receiver_name')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-number">Receiver Phone</Label>
                                <Input
                                    id="receiver-number"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={formData.receiver_phone}
                                    onChange={(e) => handleFieldChange('receiver_phone', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('receiver_phone') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('receiver_phone') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('receiver_phone')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-email">Receiver Email</Label>
                                <Input
                                    id="receiver-email"
                                    type="email"
                                    placeholder="Enter email"
                                    value={formData.receiver_email}
                                    onChange={(e) => handleFieldChange('receiver_email', e.target.value)}
                                    className={cn(
                                        "w-full",
                                        getFieldError('receiver_email') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('receiver_email') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('receiver_email')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-city">Receiver Country</Label>
                                <Select
                                    value={formData.receiver_country}
                                    onValueChange={(value) => handleFieldChange('receiver_country', value)}
                                >
                                    <SelectTrigger id="receiver-city" className={cn(
                                        getFieldError('receiver_country') && "border-red-500 focus-visible:ring-red-500"
                                    )}>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinationCountries.map((country) => (
                                            <SelectItem key={country.code} value={country.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{country.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getFieldError('receiver_country') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('receiver_country')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receiver-address">Receiver Address</Label>
                                <Textarea
                                    id="receiver-address"
                                    placeholder="Enter complete address"
                                    value={formData.receiver_address}
                                    onChange={(e) => handleFieldChange('receiver_address', e.target.value)}
                                    className={cn(
                                        getFieldError('receiver_address') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('receiver_address') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('receiver_address')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Parcel Details */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Parcel Details</h3>
                        {renderErrors(errors.package)}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="package_type">Package Type</Label>
                                <Select
                                    value={formData.package_type}
                                    onValueChange={(value) => handleFieldChange('package_type', value)}
                                >
                                    <SelectTrigger className={cn(
                                        "w-full",
                                        getFieldError('package_type') && "border-red-500 focus-visible:ring-red-500"
                                    )}>
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
                                {getFieldError('package_type') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('package_type')}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="Enter weight"
                                    value={formData.weight || ''}
                                    onChange={(e) => handleFieldChange('weight', parseFloat(e.target.value))}
                                    className={cn(
                                        "w-full",
                                        getFieldError('weight') && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                />
                                {getFieldError('weight') && (
                                    <p className="text-xs text-red-500 mt-1">{getFieldError('weight')}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label>Dimensions (cm)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <Input
                                            placeholder="Length"
                                            type="number"
                                            value={formData.length}
                                            onChange={(e) => handleFieldChange('length', parseFloat(e.target.value))}
                                            className={cn(
                                                "w-full",
                                                getFieldError('length') && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Length</span>
                                        {getFieldError('length') && (
                                            <p className="text-xs text-red-500 mt-1">{getFieldError('length')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Width"
                                            type="number"
                                            value={formData.width}
                                            onChange={(e) => handleFieldChange('width', parseFloat(e.target.value))}
                                            className={cn(
                                                "w-full",
                                                getFieldError('width') && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Width</span>
                                        {getFieldError('width') && (
                                            <p className="text-xs text-red-500 mt-1">{getFieldError('width')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Height"
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => handleFieldChange('height', parseFloat(e.target.value))}
                                            className={cn(
                                                "w-full",
                                                getFieldError('height') && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                        />
                                        <span className="text-xs text-muted-foreground mt-1">Height</span>
                                        {getFieldError('height') && (
                                            <p className="text-xs text-red-500 mt-1">{getFieldError('height')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="base-rate">Base Rate</Label>
                                <Select
                                    value={formData.base_rate}
                                    onValueChange={(value) => setFormData({ ...formData, base_rate: value })}
                                >
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
                                <Label htmlFor="packaging">Packaging (RM)</Label>
                                <Input
                                    id="packaging"
                                    type="number"
                                    min="0"
                                    placeholder="Enter the cost of packing"
                                    value={formData.packagingRM}
                                    onChange={(e) => setFormData({ ...formData, packagingRM: parseFloat(e.target.value) })}
                                />
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
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Charges */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Additional Charges</h3>
                        <div className="grid gap-2">
                            {additional_charges.map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={item.id}
                                        checked={formData.additional_charges[item.id as keyof typeof formData.additional_charges]}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                additional_charges: {
                                                    ...formData.additional_charges,
                                                    [item.id]: checked
                                                }
                                            })
                                        }
                                    />
                                    <Label htmlFor={item.id}>{item.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Bill */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="deliveryRM">Delivery(RM)</Label>
                                <Input
                                    id="deliveryRM"
                                    type="number"
                                    value={formData.deliveryRM}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalBillRM">Total Bill (RM)</Label>
                                <Input
                                    id="totalBillRM"
                                    type="number"
                                    value={formData.totalBillRM}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalBillNaira">Total Bill (Naira)</Label>
                                <Input
                                    id="totalBillNaira"
                                    type="number"
                                    value={formData.totalBillNaira}
                                    readOnly
                                />
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
                        <h3 className="font-medium">Send Bill Via</h3>
                        <RadioGroup
                            value={formData.sendBillVia}
                            onValueChange={(value) => setFormData({ ...formData, sendBillVia: value })}
                            className="flex gap-4"
                        >
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
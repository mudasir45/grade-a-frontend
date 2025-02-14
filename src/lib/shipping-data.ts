import { Country, ShippingRate } from './types'

export const countries: Country[] = [
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', currency: 'MVR' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR' },
]

export const shippingRates: ShippingRate[] = [
  {
    weightBand: '0 to 1kg',
    economy: 15.00,
    regular: 25.00,
    express: 45.00
  },
  {
    weightBand: '1+ to 2kg',
    economy: 20.00,
    regular: 35.00,
    express: 60.00
  },
  {
    weightBand: '2+ to 5kg',
    economy: 35.00,
    regular: 50.00,
    express: 85.00
  },
  {
    weightBand: '5+ to 10kg',
    economy: 60.00,
    regular: 85.00,
    express: 140.00
  }
]

export const packageTypes = [
  { id: 'document', name: 'Document', maxWeight: 1 },
  { id: 'parcel', name: 'Parcel', maxWeight: 5 },
  { id: 'box', name: 'Box', maxWeight: 10 },
  { id: 'pallet', name: 'Pallet', maxWeight: 100 }
]

export const supportCategories = [
  { id: 'shipping', name: 'Shipping Issue' },
  { id: 'tracking', name: 'Tracking Issue' },
  { id: 'payment', name: 'Payment Issue' },
  { id: 'damage', name: 'Damaged Package' },
  { id: 'delay', name: 'Delivery Delay' },
  { id: 'other', name: 'Other' }
]

export function calculateShippingCost(
  weight: number,
  serviceType: 'economy' | 'regular' | 'express',
  insurance: boolean = false,
  declaredValue: number = 0
): {
  baseRate: number
  insurance: number
  tax: number
  total: number
} {
  // Find applicable rate
  let rate = shippingRates[0]
  if (weight > 5) {
    rate = shippingRates[3]
  } else if (weight > 2) {
    rate = shippingRates[2]
  } else if (weight > 1) {
    rate = shippingRates[1]
  }

  // Calculate base rate
  const baseRate = rate[serviceType]

  // Calculate insurance (if requested)
  const insuranceCost = insurance ? (declaredValue * 0.01) : 0

  // Calculate tax (assume 7% GST)
  const subtotal = baseRate + insuranceCost
  const tax = subtotal * 0.07

  // Calculate total
  const total = subtotal + tax

  return {
    baseRate,
    insurance: insuranceCost,
    tax,
    total
  }
}

export function generateTrackingNumber(): string {
  const prefix = 'RBX'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}
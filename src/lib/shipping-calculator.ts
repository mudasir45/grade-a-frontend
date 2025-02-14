// Shipping rate calculation constants
const BASE_RATES = {
  document: {
    base: 15,
    perKg: 5
  },
  parcel: {
    base: 25,
    perKg: 8
  },
  box: {
    base: 35,
    perKg: 10
  },
  pallet: {
    base: 100,
    perKg: 15
  }
}

const ZONE_MULTIPLIERS: { [key: string]: number } = {
  // Zone 1: Within same country
  SAME: 1,
  // Zone 2: Neighboring countries
  NEAR: 1.5,
  // Zone 3: Same region
  REGIONAL: 2,
  // Zone 4: International
  INTERNATIONAL: 3
}

const COUNTRY_ZONES: { [key: string]: { [key: string]: string } } = {
  MY: {
    SG: 'NEAR',
    ID: 'NEAR',
    TH: 'NEAR',
    VN: 'REGIONAL',
    PH: 'REGIONAL',
    DEFAULT: 'INTERNATIONAL'
  },
  SG: {
    MY: 'NEAR',
    ID: 'NEAR',
    TH: 'REGIONAL',
    VN: 'REGIONAL',
    PH: 'REGIONAL',
    DEFAULT: 'INTERNATIONAL'
  }
  // Add more country relationships as needed
}

const SERVICE_MULTIPLIERS = {
  economy: 1,
  standard: 1.5,
  express: 2.5
}

interface DimensionWeight {
  length: number
  width: number
  height: number
  actualWeight: number
}

export interface ShippingCost {
  baseRate: number
  weightCharge: number
  dimensionalCharge: number
  zoneCharge: number
  serviceCharge: number
  insuranceCharge: number
  fuelSurcharge: number
  total: number
  currency: string
}

export function calculateShippingCost(
  fromCountry: string,
  toCountry: string,
  packageType: string,
  dimensions: DimensionWeight,
  serviceType: 'economy' | 'standard' | 'express',
  declaredValue: number = 0,
  addInsurance: boolean = false
): ShippingCost {
  // Calculate dimensional weight (L x W x H / 5000)
  const dimensionalWeight = (
    dimensions.length * 
    dimensions.width * 
    dimensions.height
  ) / 5000

  // Use the greater of actual vs dimensional weight
  const chargeableWeight = Math.max(dimensions.actualWeight, dimensionalWeight)

  // Get base rate for package type
  const baseRate = BASE_RATES[packageType as keyof typeof BASE_RATES].base
  const perKgRate = BASE_RATES[packageType as keyof typeof BASE_RATES].perKg

  // Calculate weight charge
  const weightCharge = chargeableWeight * perKgRate

  // Calculate dimensional charge (if dimensional weight is greater)
  const dimensionalCharge = dimensionalWeight > dimensions.actualWeight 
    ? (dimensionalWeight - dimensions.actualWeight) * perKgRate * 0.5
    : 0

  // Calculate zone multiplier
  const zone = COUNTRY_ZONES[fromCountry]?.[toCountry] || 
               COUNTRY_ZONES[fromCountry]?.['DEFAULT'] || 
               'INTERNATIONAL'
  const zoneMultiplier = ZONE_MULTIPLIERS[zone]
  const zoneCharge = (baseRate + weightCharge) * (zoneMultiplier - 1)

  // Calculate service charge
  const serviceMultiplier = SERVICE_MULTIPLIERS[serviceType]
  const serviceCharge = (baseRate + weightCharge) * (serviceMultiplier - 1)

  // Calculate insurance (if requested)
  const insuranceCharge = addInsurance ? Math.max(declaredValue * 0.01, 5) : 0

  // Calculate fuel surcharge (example: 5% of base charges)
  const fuelSurcharge = (baseRate + weightCharge) * 0.05

  // Calculate total
  const total = baseRate + 
                weightCharge + 
                dimensionalCharge + 
                zoneCharge + 
                serviceCharge + 
                insuranceCharge + 
                fuelSurcharge

  return {
    baseRate,
    weightCharge,
    dimensionalCharge,
    zoneCharge,
    serviceCharge,
    insuranceCharge,
    fuelSurcharge,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    currency: 'USD'
  }
}
export interface Shipment {
  id: string
  tracking_number: string
  status: ShipmentStatus
  sender_name: string
  sender_email: string
  sender_phone: string
  sender_address: string
  sender_country: string
  recipient_name: string
  recipient_email: string
  recipient_phone: string
  recipient_address: string
  recipient_country: string
  package_type: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  description: string
  declared_value: number
  service_type: 'economy' | 'standard' | 'express'
  insurance_required: boolean
  signature_required: boolean
  shipping_cost: number
  created_at: string
  updated_at: string
}

export type ShipmentStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'CANCELLED'

export interface TrackingUpdate {
  timestamp: string
  location: string
  status: string
  description: string
}

export interface ShippingRate {
  base_rate: number
  weight_charge: number
  dimensional_charge: number
  zone_charge: number
  service_charge: number
  insurance_charge: number
  fuel_surcharge: number
  total: number
  currency: string
}

export interface SupportTicket {
  id: string
  subject: string
  category: string
  message: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  created_at: string
  updated_at: string
} 
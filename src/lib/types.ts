// Existing types...

export interface ShipmentStatus {
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled'
  timestamp: string
  description: string
  location?: string
}

export interface Shipment {
  id: string
  userId: string
  trackingNumber: string
  status: ShipmentStatus[]
  senderDetails: {
    name: string
    email: string
    phone: string
    address: string
    country: string
  }
  recipientDetails: {
    name: string
    email: string
    phone: string
    address: string
    country: string
  }
  packageDetails: {
    type: string
    weight: number
    dimensions: string
    description: string
    declaredValue: number
  }
  serviceType: 'economy' | 'standard' | 'express'
  insurance: boolean
  signature: boolean
  cost: {
    baseRate: number
    insurance: number
    tax: number
    total: number
  }
  createdAt: string
  estimatedDelivery: string
  currency: string
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  category: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  responses?: {
    message: string
    from: 'user' | 'support'
    timestamp: string
  }[]
}
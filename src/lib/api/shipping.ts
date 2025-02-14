'use client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ShipmentRequest {
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
  length: number
  width: number
  height: number
  description: string
  declared_value: number
  service_type: 'economy' | 'standard' | 'express'
  insurance_required: boolean
  signature_required: boolean
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export class ShippingAPI {
  private static getHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  static async createShipment(data: ShipmentRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipping/shipments/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create shipment')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create shipment')
    }
  }

  static async getShipments(params: {
    page?: number
    status?: string
    search?: string
  } = {}) {
    try {
      const query = new URLSearchParams()
      if (params.page) query.append('page', params.page.toString())
      if (params.status) query.append('status', params.status)
      if (params.search) query.append('search', params.search)

      const response = await fetch(
        `${API_BASE_URL}/shipping/shipments/?${query}`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch shipments')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch shipments')
    }
  }

  static async getShipmentDetails(id: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shipping/shipments/${id}/`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch shipment details')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to fetch shipment details')
    }
  }

  static async trackShipment(trackingNumber: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shipping/track/${trackingNumber}/`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        throw new Error('Failed to track shipment')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to track shipment')
    }
  }

  static async calculateRate(data: {
    origin_country: string
    destination_country: string
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    service_type: string
    declared_value?: number
    insurance_required?: boolean
  }) {
    try {
        // http://127.0.0.1:8000/api/shipping-rates/calculate/calculate/
      const response = await fetch(`${API_BASE_URL}/shipping-rates/calculate/calculate/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({...data, length: data.dimensions.length, width: data.dimensions.width, height: data.dimensions.height})
      })

      if (!response.ok) {
        throw new Error('Failed to calculate shipping rate')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to calculate shipping rate')
    }
  }

  static async createSupportTicket(data: {
    subject: string
    category: string
    message: string
    shipment_id?: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipping/support/tickets/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create support ticket')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create support ticket')
    }
  }

  static async updateShipmentStatus(id: string, status: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/shipping/shipments/${id}/status/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update shipment status')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update shipment status')
    }
  }
} 
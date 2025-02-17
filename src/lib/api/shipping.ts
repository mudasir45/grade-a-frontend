'use client'

import { toast } from 'react-hot-toast'
import type { ShipmentResponse } from '../types/shipping'
import { ShipmentRequest } from "../types/shipping"
import { PaymentAPI } from './payment'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'



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

  static async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    try {
      // 1. Calculate shipping rate
      const rate = await this.calculateRate({
        origin_country: data.sender_country,
        destination_country: data.recipient_country,
        weight: data.weight,
        dimensions: {
          length: data.length,
          width: data.width,
          height: data.height
        },
        service_type: data.service_type
      })

      // 2. Create payment intent
      const paymentIntent = await PaymentAPI.createPaymentIntent({
        amount: rate.cost_breakdown.total_cost,
        currency: 'USD',
        payment_method: data.payment_method!,
        payment_details: data.payment_details!
      })

      // 3. Create shipment with payment reference
      const response = await fetch(`${API_BASE_URL}/shipments/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          payment_intent_id: paymentIntent.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create shipment')
      }

      const shipment = await response.json()

      // 4. Confirm payment
      await PaymentAPI.confirmPayment(paymentIntent.id)

      return shipment
    } catch (error) {
      // Handle payment failure
      if (error instanceof Error && error.message.includes('payment')) {
        await this.handlePaymentFailure(error)
      }
      throw error instanceof Error ? error : new Error('Failed to create shipment')
    }
  }

  private static async handlePaymentFailure(error: Error) {
    // Implement payment failure recovery logic
    toast({
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again.',
      variant: 'destructive'
    })
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
      const response = await fetch(`${API_BASE_URL}/shipping-rates/calculate/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
            ...data, 
            length: data.dimensions.length, 
            width: data.dimensions.width, 
            height: data.dimensions.height
        })
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
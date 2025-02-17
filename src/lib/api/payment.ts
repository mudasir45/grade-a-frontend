'use client'

import { BoostIcon, CardIcon, FPXIcon, GrabPayIcon } from '@/components/icons/payment';
import { PaymentIntent, PaymentMethod } from '@/lib/types/payment';
import { API_BASE_URL } from '../config';

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: CardIcon,
    enabled: true
  },
  // Other methods disabled for now
  {
    id: 'fpx',
    type: 'fpx',
    name: 'FPX Online Banking (Coming Soon)',
    icon: FPXIcon,
    enabled: false
  },
  {
    id: 'grabpay',
    type: 'grabpay',
    name: 'GrabPay (Coming Soon)',
    icon: GrabPayIcon,
    enabled: false
  },
  {
    id: 'boost',
    type: 'boost',
    name: 'Boost (Coming Soon)',
    icon: BoostIcon,
    enabled: false
  }
] as const;

export class PaymentAPI {
  private static getHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  static async createPaymentIntent(data: {
    amount: number
    currency: string
    payment_method: string
    payment_details: any
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create payment')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create payment')
    }
  }

  static async confirmPayment(paymentIntentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentIntentId}/confirm/`, {
        method: 'POST',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to confirm payment')
      }

      return response.json()
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to confirm payment')
    }
  }

  static async updatePaymentMethod(
    paymentIntentId: string,
    data: {
      payment_method_id?: string
      fpx_bank?: string
    }
  ): Promise<PaymentIntent> {
    const response = await fetch(`/api/payments/${paymentIntentId}/update-method`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment method');
    }

    return response.json();
  }

  static async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await fetch(`/api/payments/${paymentIntentId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment status');
    }

    return response.json();
  }
} 
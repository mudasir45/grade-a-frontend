import { BoostIcon, CardIcon, FPXIcon, GrabPayIcon } from '@/components/icons/payment';
import { PaymentIntent, PaymentMethod } from '@/lib/types/payment';

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
  static async createPaymentIntent(data: {
    amount: number // Amount in cents
    currency: string
    payment_method_type: string
    request_id: string
  }): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create payment intent');
      }

      return responseData;
    } catch (error) {
      console.error('Payment API Error:', error);
      throw error;
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
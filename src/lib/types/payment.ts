import { FC, SVGProps } from 'react';

export interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  enabled: boolean;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  payment_method_types: string[];
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  id: string;
}

export interface PaymentErrorResponse {
  error: string;
}

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  payment_method_type: string;
  request_id: string;
} 

export type PaymentMethodType = 
  | 'card' 
  | 'fpx' 
  | 'ewallet'
  | 'bank_transfer'

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  logo: string;
  description: string;
  currencies: string[];
  minAmount?: number;
  maxAmount?: number;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card',
    logo: '/images/payments/cards.png',
    description: 'Pay with Visa, Mastercard, or American Express',
    currencies: ['MYR', 'USD'],
    enabled: true
  },
  {
    id: 'fpx',
    name: 'FPX Online Banking',
    type: 'fpx',
    logo: '/images/payments/fpx.png',
    description: 'Pay directly from your Malaysian bank account',
    currencies: ['MYR'],
    enabled: true
  },
  {
    id: 'tng',
    name: 'Touch n Go eWallet',
    type: 'ewallet',
    logo: '/images/payments/tng.png',
    description: 'Pay with Touch n Go eWallet',
    currencies: ['MYR'],
    enabled: true
  },
  {
    id: 'grabpay',
    name: 'GrabPay',
    type: 'ewallet',
    logo: '/images/payments/grabpay.png',
    description: 'Pay with GrabPay',
    currencies: ['MYR'],
    enabled: true
  },
  {
    id: 'boost',
    name: 'Boost',
    type: 'ewallet',
    logo: '/images/payments/boost.png',
    description: 'Pay with Boost',
    currencies: ['MYR'],
    enabled: true
  }
]

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

export interface BizapayPayment {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  paymentUrl: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentResponse {
  payment: BizapayPayment
  redirectUrl: string
}

export interface PaymentStatusResponse {
  payment: BizapayPayment
}

export interface WebhookEvent {
  type: string
  data: {
    payment: BizapayPayment
  }
  signature: string
} 
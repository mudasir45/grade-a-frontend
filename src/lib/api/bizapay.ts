const BIZAPAY_API_URL = process.env.NEXT_PUBLIC_BIZAPAY_API_URL || 'https://bizappay.my'
const BIZAPAY_API_KEY = process.env.NEXT_PUBLIC_BIZAPAY_API_KEY

interface BizapayConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
}

// Updated payment method types according to latest doc
type PaymentMethodType = 
  | 'card' 
  | 'fpx' 
  | 'grabpay'
  | 'boost'
  | 'tng'
  | 'shopeepay'
  | 'maybankqr'

interface PaymentMethod {
  type: PaymentMethodType
  bank_code?: string // For FPX payments
}

interface PaymentRequest {
  amount: number
  currency: string
  reference_id: string // Changed from orderId
  description?: string
  customer: {
    email: string
    name?: string
    phone?: string
  }
  payment_method: PaymentMethod
  redirect: {
    success_url: string
    failure_url: string // Changed from cancelUrl
  }
  webhook_url: string
  metadata?: Record<string, any>
}

interface PaymentResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  amount: number
  currency: string
  reference_id: string
  payment_url: string // URL to redirect user for payment
  created_at: string
  expires_at: string
}

export class BizapayAPI {
  private static config: BizapayConfig = {
    apiKey: BIZAPAY_API_KEY || '',
    environment: (process.env.NEXT_PUBLIC_BIZAPAY_ENV || 'sandbox') as 'sandbox' | 'production'
  }

  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
      'Accept': 'application/json'
    }
  }

  private static getApiUrl() {
    const baseUrl = this.config.environment === 'sandbox'
      ? 'https://sandbox.bizappay.my'
      : 'https://bizappay.my'
    
    return `${baseUrl}/api/v3`
  }

  private static async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    try {
      // For Node.js environments, ignore SSL certificate issues in development
      if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
        const https = require('https')
        options.agent = new https.Agent({
          rejectUnauthorized: false
        })
      }

      const response = await fetch(url, options)
      return response
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes('certificate')) {
        console.log(`Retrying request to ${url}, ${retries} attempts left`)
        return this.fetchWithRetry(url, options, retries - 1)
      }
      throw error
    }
  }

  static async createPayment(data: Omit<PaymentRequest, 'payment_method'> & { paymentMethod: PaymentMethod }): Promise<PaymentResponse> {
    try {
      const apiUrl = this.getApiUrl()
      console.log('Making payment request to:', apiUrl)

      const requestBody = {
        amount: data.amount,
        currency: data.currency,
        reference_id: data.reference_id,
        description: data.description,
        customer: data.customer,
        payment_method: data.paymentMethod,
        redirect: {
          success_url: data.redirect.success_url,
          failure_url: data.redirect.failure_url
        },
        webhook_url: data.webhook_url,
        metadata: data.metadata
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${apiUrl}/payment/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.message || 'Failed to create payment')
        } catch (e) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
      }

      const responseData = await response.json()
      console.log('API Response:', responseData)
      return responseData
    } catch (error) {
      console.error('Bizapay payment creation error:', error)
      throw error
    }
  }

  static async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.getApiUrl()}/payment/${paymentId}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.message || 'Failed to get payment')
        } catch (e) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
      }

      return response.json()
    } catch (error) {
      console.error('Bizapay payment retrieval error:', error)
      throw error
    }
  }

  static validateWebhook(payload: unknown, signature: string): boolean {
    try {
      const data = typeof payload === 'string' ? payload : JSON.stringify(payload)
      const hmac = require('crypto').createHmac('sha256', this.config.apiKey)
      const expectedSignature = hmac.update(data).digest('hex')
      
      return require('crypto').timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    } catch (error) {
      console.error('Webhook validation failed:', error)
      return false
    }
  }
} 
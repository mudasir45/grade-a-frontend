'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { PaymentAPI } from '@/lib/api/payment'
import { formatCurrency } from '@/lib/utils'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

interface PaymentFormProps {
  amount: number
  currency: string
  requestId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}

export function PaymentForm({ amount, currency, requestId, onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!amount || amount <= 0) {
          throw new Error('Invalid payment amount')
        }

        const { client_secret } = await PaymentAPI.createPaymentIntent({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          payment_method_type: 'card',
          request_id: requestId
        })

        setClientSecret(client_secret)
      } catch (error) {
        toast({
          title: 'Payment Error',
          description: error instanceof Error ? error.message : 'Failed to initialize payment',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    initializePayment()
  }, [amount, currency, requestId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-6 text-red-500">
        Failed to initialize payment gateway
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0f172a',
                colorBackground: '#ffffff',
                colorText: '#1a1a1a',
              },
            },
            fields: {
              billingDetails: 'auto'
            }
          }}
        >
          <PaymentFormContent
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}

function PaymentFormContent({
  amount,
  currency,
  onSuccess,
  onCancel,
}: {
  amount: number
  currency: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
}) {
  const { toast } = useToast()
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/buy4me/payment/processing`,
          payment_method_data: {
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
              address: {
                country: 'MY'
              }
            }
          }
        },
        redirect: 'if_required'
      })

      if (error) throw error
      
      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        router.push(`/buy4me/payment/processing?payment_intent=${paymentIntent?.id}`)
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            value={billingDetails.name}
            onChange={(e) => setBillingDetails({...billingDetails, name: e.target.value})}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails({...billingDetails, email: e.target.value})}
            required
          />
        </div>
        <PaymentElement
          options={{
            fields: {
              billingDetails: 'auto'
            }
          }}
        />
      </div>

      <input type="hidden" name="billing_name" value="Customer Name" />
      <input type="hidden" name="billing_email" value="customer@example.com" />

      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="flex-1"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `Pay ${formatCurrency(amount, currency)}`
          )}
        </Button>
      </div>
    </form>
  )
}
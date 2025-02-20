'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BizapayAPI } from '@/lib/api/bizapay'
import { useState } from 'react'

export default function PaymentTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testScenarios = [
    {
      name: 'Successful Payment',
      run: async () => {
        const payment = await BizapayAPI.createPayment({
          amount: 100.50,
          currency: 'MYR',
          orderId: 'TEST-' + Date.now(),
          description: 'Test Success Payment',
          customerEmail: 'test@example.com',
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          webhookUrl: `${window.location.origin}/api/webhooks/bizapay`
        })
        return payment
      }
    },
    {
      name: 'Failed Payment',
      run: async () => {
        const payment = await BizapayAPI.createPayment({
          amount: 0.50, // Amount too low
          currency: 'MYR',
          orderId: 'TEST-' + Date.now(),
          description: 'Test Failed Payment',
          customerEmail: 'test@example.com',
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          webhookUrl: `${window.location.origin}/api/webhooks/bizapay`
        })
        return payment
      }
    }
  ]

  const runTest = async (test: typeof testScenarios[0]) => {
    setLoading(true)
    try {
      const result = await test.run()
      setResult(result)
      // Redirect to payment page if needed
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (error) {
      setResult(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testScenarios.map((test, index) => (
            <Button
              key={index}
              onClick={() => runTest(test)}
              disabled={loading}
              className="w-full"
            >
              {test.name}
            </Button>
          ))}

          {result && (
            <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
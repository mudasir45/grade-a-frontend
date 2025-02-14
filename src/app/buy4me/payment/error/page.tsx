'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Payment failed'

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="text-red-500" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-500">{error}</p>
          <Button 
            className="w-full" 
            onClick={() => router.push('/buy4me')}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 
'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface ShippingSuccessProps {
  shipment: {
    tracking_number: string
    total_cost: number
    service_type: string
    sender_country: string
    recipient_country: string
  }
}

export function ShippingSuccess({ shipment }: ShippingSuccessProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle>Shipment Created Successfully!</CardTitle>
        <CardDescription>
          Your shipment has been created and is ready for pickup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tracking Number:</span>
            <span className="font-medium">{shipment.tracking_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Type:</span>
            <span className="font-medium">{shipment.service_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">From Country:</span>
            <span className="font-medium">{shipment.sender_country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">To Country:</span>
            <span className="font-medium">{shipment.recipient_country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Cost:</span>
            <span className="font-medium">
              {formatCurrency(shipment.total_cost, 'USD')}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/shipping">Track Shipment</Link>
        </Button>
        <Button asChild>
          <Link href="/shipping">Create Another Shipment</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 
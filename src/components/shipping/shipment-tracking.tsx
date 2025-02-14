'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ShippingAPI } from '@/lib/api/shipping'
import type { TrackingUpdate } from '@/lib/types/shipping'
import { motion } from 'framer-motion'
import { MapPin, Package, Search, Truck } from 'lucide-react'
import { useState } from 'react'

interface TrackingResult {
  tracking_number: string
  status: string
  estimated_delivery: string
  current_location: string
  updates: TrackingUpdate[]
}

export function ShipmentTracking() {
  const { toast } = useToast()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await ShippingAPI.trackShipment(trackingNumber)
      setTrackingResult(result)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to track shipment',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Shipment</CardTitle>
          <CardDescription>
            Enter your tracking number to get real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading || !trackingNumber}>
              {loading ? 'Tracking...' : 'Track Package'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {trackingResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center gap-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-2xl font-bold">{trackingResult.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-2xl font-bold">
                      {new Date(trackingResult.estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Location</p>
                    <p className="text-2xl font-bold">{trackingResult.current_location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                {trackingResult.updates.map((update: TrackingUpdate, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-10"
                  >
                    <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(update.date).toLocaleString()}
                      </p>
                      <p className="font-medium">{update.status}</p>
                      <p className="text-sm text-muted-foreground">{update.location}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
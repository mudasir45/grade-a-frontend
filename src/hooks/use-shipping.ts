'use client'

import { useState } from 'react'
import { useAuth } from './use-auth'
import { useToast } from './use-toast'
import { storage } from '@/lib/storage'
import { calculateShippingCost, generateTrackingNumber } from '@/lib/shipping-data'
import type { Shipment, ShipmentStatus } from '@/lib/types'

export function useShipping() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const createShipment = async (shipmentData: Partial<Shipment>) => {
    if (!user) throw new Error('User not authenticated')
    setLoading(true)
// 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled'
    try {
      const cost = calculateShippingCost(
        shipmentData.packageDetails?.weight || 0,
        shipmentData.serviceType || 'standard',
        shipmentData.insurance,
        shipmentData.packageDetails?.declaredValue
      )

      const shipment: Shipment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        trackingNumber: generateTrackingNumber(),
        status: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: 'Shipment created'
        }],
        ...shipmentData,
        cost,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'USD'
      } as Shipment

      // Save shipment
      storage.saveShipment(shipment)

      toast({
        title: 'Shipment Created',
        description: `Tracking number: ${shipment.trackingNumber}`,
      })

      return shipment
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create shipment',
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getShipments = () => {
    if (!user) return []
    return storage.getUserShipments(user.id)
  }

  const getShipment = (trackingNumber: string) => {
    return storage.getShipmentByTracking(trackingNumber)
  }

  const updateShipmentStatus = (
    trackingNumber: string,
    status: ShipmentStatus['status'],
    description: string,
    location?: string
  ) => {
    if (!user) throw new Error('User not authenticated')

    const shipment = storage.getShipmentByTracking(trackingNumber)
    if (!shipment) throw new Error('Shipment not found')

    const updatedStatus: ShipmentStatus = {
      status,
      timestamp: new Date().toISOString(),
      description,
      location
    }

    shipment.status.push(updatedStatus)
    storage.updateShipment(shipment)

    return shipment
  }

  return {
    loading,
    createShipment,
    getShipments,
    getShipment,
    updateShipmentStatus
  }
}
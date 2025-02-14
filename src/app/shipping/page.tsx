'use client'

import { CustomerProfile } from '@/components/shipping/customer-profile'
import { CustomerSupport } from '@/components/shipping/customer-support'
import { ShippingHeader } from '@/components/shipping/header'
import { ShippingShell } from '@/components/shipping/shell'
import { ShipmentForm } from '@/components/shipping/shipment-form'
import { ShipmentHistory } from '@/components/shipping/shipment-history'
import { ShipmentTracking } from '@/components/shipping/shipment-tracking'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { History, MessageSquare, Package, Truck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ShippingDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('ship')
  const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     if (mounted && !user) {
//       router.push('/')
//     }
//   }, [mounted, user, router])

//   if (!mounted || !user) {
//     return null
//   }

  return (
    <ShippingShell>
      <ShippingHeader
        heading="Shipping Dashboard"
        text="Manage your shipments and track your packages"
      />
      
      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Active Shipments</div>
            </div>
            <div className="mt-2 text-2xl font-bold">5</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">In Transit</div>
            </div>
            <div className="mt-2 text-2xl font-bold">3</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Completed</div>
            </div>
            <div className="mt-2 text-2xl font-bold">28</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Support Tickets</div>
            </div>
            <div className="mt-2 text-2xl font-bold">1</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ship" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ship Package
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Track Shipments
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ship" className="space-y-4">
            <ShipmentForm />
          </TabsContent>

          <TabsContent value="track" className="space-y-4">
            <ShipmentTracking />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ShipmentHistory />
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <CustomerSupport />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <CustomerProfile />
          </TabsContent>
        </Tabs>
      </div>
    </ShippingShell>
  )
}
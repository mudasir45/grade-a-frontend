'use client'

import { CustomerProfile } from '@/components/shipping/customer-profile'
import { CustomerSupport } from '@/components/shipping/customer-support'
import { ShippingHeader } from '@/components/shipping/header'
import { ShippingShell } from '@/components/shipping/shell'
import { ShipmentForm } from '@/components/staff/shipment-form'
import { ManageShipment } from '@/components/staff/manage-shipment'
import { ShipmentHistory } from '@/components/shipping/shipment-history'
import { ShipmentTracking } from '@/components/shipping/shipment-tracking'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { History, MessageSquare, Package, Truck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ShippingDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('createShipment')
  const { user, getUser, loading } = useAuth()

  useEffect(() => {
    if (!loading) {  // Only run if not loading
      getUser()
      .then((user) => {
        if (user?.user_type !== 'WALK_IN') {
          router.push('/')
          toast({
            title: 'Unauthorized',
            description: 'You are not authorized to access this page',
          })
        }
      })
      .catch((error) => {
        console.error('Failed to get user:', error)
      })
    }
  }, []) // Remove loading from dependencies

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <ShippingShell>
      <div className="container mx-auto sm:px-6 lg:px-8 py-6">
        <ShippingHeader
          heading="Shipping Staff Dashboard"
          text="Manage all shipments and track your packages"
        />
        
        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Active Shipments</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">5</div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">In Transit</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">3</div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Completed</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">28</div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Support Tickets</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">1</div>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Desktop and Tablet Navigation */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="createShipment" className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>Create Shipment</span>
                </TabsTrigger>
                <TabsTrigger value="manageShipments" className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>Manage Shipments</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Primary */}
            <div className="sm:hidden">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="createShipment" className="flex items-center justify-center gap-1 text-xs">
                  <Package className="h-4 w-4" />
                  <span>Create Shipment</span>
                </TabsTrigger>
                <TabsTrigger value="manageShipments" className="flex items-center justify-center gap-1 text-xs">
                  <Package className="h-4 w-4" />
                  <span>Manage Shipments</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4 sm:mt-6">
              <TabsContent value="createShipment" className="space-y-4">
                <ShipmentForm />
              </TabsContent>
              <TabsContent value="manageShipments" className="space-y-4">
                <ManageShipment />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ShippingShell>
  )
}
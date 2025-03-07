'use client'

import { ShippingHeader } from '@/components/shipping/header'
import { ShippingShell } from '@/components/shipping/shell'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { History, MessageSquare, Package, Truck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DriverDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('currentJobs')
  const { user, getUser, loading } = useAuth()
  const [shipments, setShipments] = useState([])
  const [users,setUsers] = useState([])
 


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
          heading="Driver Dashboard"
          text="Manage all jobs and COD payments"
        />

        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Assigned Curent Jobs</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">5</div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Total Executed Jobs</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">3</div>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Desktop and Tablet Navigation */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-4 gap-1">
                <TabsTrigger value="currentJobs" className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>Current Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  <span>Job History</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Primary */}
            <div className="sm:hidden">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="currentJobs" className="flex items-center justify-center gap-1 text-xs">
                  <Truck className="h-4 w-4" />
                  <span>Current Jobs</span>
                </TabsTrigger>
                <TabsTrigger value="design" className="flex items-center justify-center gap-1 text-xs">
                  <History className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Secondary */}
            <div className="sm:hidden mt-2">
              <TabsList className="grid w-full grid-cols-2 gap-2">
                <TabsTrigger value="history" className="flex items-center justify-center gap-1 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  <span>Job History</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center justify-center gap-1 text-xs">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4 sm:mt-6">
            
              <TabsContent value="track" className="space-y-4">
                
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
               
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
               
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ShippingShell>
  )
}
"use client";

import { CustomerProfile } from "@/components/shipping/customer-profile";
import { CustomerSupport } from "@/components/shipping/customer-support";
import { ShippingHeader } from "@/components/shipping/header";
import { ShippingShell } from "@/components/shipping/shell";
import { ShipmentForm } from "@/components/shipping/shipment-form";
import { ShipmentHistory } from "@/components/shipping/shipment-history";
import { ShipmentTracking } from "@/components/shipping/shipment-tracking";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { History, MessageSquare, Package, Truck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ShipmentStats {
  active_shipments: number;
  in_transit: number;
  completed: number;
  support_tickets: number;
}

export default function ShippingDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ship");
  const { user, getUser, loading } = useAuth();
  const [shipmentStats, setShipmentStats] = useState<ShipmentStats | null>(
    null
  );

  const getShipmentStats = async () => {
    const response = await ShippingAPI.getShipmentStats();
    setShipmentStats({ ...response, support_tickets: 1 });
  };

  useEffect(() => {
    if (!loading) {
      // Only run if not loading
      getUser()
        .then((user) => {
          if (user?.user_type !== "WALK_IN") {
            router.push("/");
            toast({
              title: "Unauthorized",
              description: "You are not authorized to access this page",
            });
          }
        })
        .catch((error) => {
          console.error("Failed to get user:", error);
        });
    }

    getShipmentStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ShippingShell>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ShippingHeader
          heading="Shipping Dashboard"
          text="Manage your shipments and track your packages"
        />

        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Active Shipments
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {shipmentStats?.active_shipments}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">In Transit</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {shipmentStats?.in_transit}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Completed</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {shipmentStats?.completed}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Support Tickets
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {shipmentStats?.support_tickets}
              </div>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            {/* Desktop and Tablet Navigation */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-5 gap-1">
                <TabsTrigger
                  value="ship"
                  className="flex items-center gap-2 text-sm"
                >
                  <Package className="h-4 w-4" />
                  <span>Ship Package</span>
                </TabsTrigger>
                <TabsTrigger
                  value="track"
                  className="flex items-center gap-2 text-sm"
                >
                  <Truck className="h-4 w-4" />
                  <span>Track Shipments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 text-sm"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger
                  value="support"
                  className="flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Support</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 text-sm"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Primary */}
            <div className="sm:hidden">
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger
                  value="ship"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <Package className="h-4 w-4" />
                  <span>Ship</span>
                </TabsTrigger>
                <TabsTrigger
                  value="track"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <Truck className="h-4 w-4" />
                  <span>Track</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Secondary */}
            <div className="sm:hidden mt-2">
              <TabsList className="grid w-full grid-cols-2 gap-2">
                <TabsTrigger
                  value="support"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Support</span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4 sm:mt-6">
              <TabsContent value="ship" className="space-y-4">
                <ShipmentForm onSuccess={() => getShipmentStats()} />
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
            </div>
          </Tabs>
        </div>
      </div>
    </ShippingShell>
  );
}

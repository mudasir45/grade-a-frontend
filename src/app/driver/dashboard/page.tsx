"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDriverBuy4meOrders,
  useDriverDashboard,
  useDriverShipments,
  useUpdateBuy4meStatus,
  useUpdateShipmentStatus,
} from "@/hooks/use-driver";
import { ShipmentStatus } from "@/lib/types/driver";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("shipments");
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDriverDashboard();
  const { data: shipments, isLoading: isShipmentsLoading } =
    useDriverShipments();
  const { data: buy4meOrders, isLoading: isBuy4meLoading } =
    useDriverBuy4meOrders();
  const updateShipmentStatus = useUpdateShipmentStatus();
  const updateBuy4meStatus = useUpdateBuy4meStatus();

  const handleStatusUpdate = async (
    id: string,
    status: ShipmentStatus,
    type: "shipment" | "buy4me"
  ) => {
    try {
      if (type === "shipment") {
        await updateShipmentStatus.mutateAsync({
          shipmentId: id,
          data: { status },
        });
      } else {
        await updateBuy4meStatus.mutateAsync({
          requestId: id,
          data: { status },
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.profile.total_deliveries || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.profile.total_earnings || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.earnings_today || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shipments">Delivery Shipments</TabsTrigger>
          <TabsTrigger value="buy4me">Buy4me Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="shipments">
          <div className="rounded-md border">
            {isShipmentsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="divide-y">
                {shipments?.map((shipment) => (
                  <div key={shipment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          #{shipment.tracking_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {shipment.pickup_location} →{" "}
                          {shipment.delivery_location}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            shipment.status === "DELIVERED"
                              ? "success"
                              : "default"
                          }
                        >
                          {shipment.status}
                        </Badge>
                        {shipment.status !== "DELIVERED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(
                                shipment.id,
                                "DELIVERED",
                                "shipment"
                              )
                            }
                            disabled={updateShipmentStatus.isPending}
                          >
                            {updateShipmentStatus.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="buy4me">
          <div className="rounded-md border">
            {isBuy4meLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="divide-y">
                {buy4meOrders?.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          #{order.tracking_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.pickup_location} → {order.delivery_location}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            order.status === "DELIVERED" ? "success" : "default"
                          }
                        >
                          {order.status}
                        </Badge>
                        {order.status !== "DELIVERED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(
                                order.id,
                                "DELIVERED",
                                "buy4me"
                              )
                            }
                            disabled={updateBuy4meStatus.isPending}
                          >
                            {updateBuy4meStatus.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

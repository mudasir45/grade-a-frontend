"use client";

import { EmbeddedBrowser } from "@/components/buy4me/embedded-browser";
import { Buy4MeHeader } from "@/components/buy4me/header";
import { OrderHistory } from "@/components/buy4me/order-history";
import { OrderSummary } from "@/components/buy4me/order-summary";
import { Buy4MeProfile } from "@/components/buy4me/profile";
import { RequestList } from "@/components/buy4me/request-list";
import { Buy4MeShell } from "@/components/buy4me/shell";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Buy4MeAPI } from "@/lib/api/buy4me";
import { CreditCard, History, List, ShoppingBag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Buy4meStats {
  active_requests: number;
  pending_payments: number;
  orders_in_transit: number;
  completed_orders: number;
}

export default function Buy4MePage() {
  const { user, getUser, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("browse");
  const [buy4meStats, setBuy4meStats] = useState<Buy4meStats | null>(null);

  const getBuy4meStats = async () => {
    const response = await Buy4MeAPI.getBuy4meStats();
    setBuy4meStats(response);
  };

  useEffect(() => {
    if (!loading) {
      // Only run if not loading
      getUser()
        .then((user) => {
          if (user?.user_type !== "BUY4ME") {
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
    getBuy4meStats();
  }, []); // Remove loading from dependencies

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Buy4MeShell>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Buy4MeHeader
          heading="Buy4Me Dashboard"
          text="Manage your international shopping requests and orders"
        />

        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Active Requests
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {buy4meStats?.active_requests}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Pending Payments
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {buy4meStats?.pending_payments}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Orders in Transit
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {buy4meStats?.orders_in_transit}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">
                  Completed Orders
                </div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {buy4meStats?.completed_orders}
              </div>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            {/* Desktop and Tablet Navigation */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-5 gap-1">
                <TabsTrigger
                  value="browse"
                  className="flex items-center gap-2 text-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Browse & Select</span>
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="flex items-center gap-2 text-sm"
                >
                  <List className="h-4 w-4" />
                  <span>My Requests</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-2 text-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Order Summary</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 text-sm"
                >
                  <History className="h-4 w-4" />
                  <span>Order History</span>
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
                  value="browse"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Browse</span>
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <List className="h-4 w-4" />
                  <span>Requests</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation - Secondary */}
            <div className="sm:hidden mt-2">
              <TabsList className="grid w-full grid-cols-2 gap-2">
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
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
              <TabsContent value="browse" className="space-y-4">
                <EmbeddedBrowser />
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <RequestList onCheckout={() => handleTabChange("orders")} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <OrderSummary />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <OrderHistory />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Buy4MeProfile />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Buy4MeShell>
  );
}

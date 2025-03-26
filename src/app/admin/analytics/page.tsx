"use client";

import { Buy4MeAnalytics } from "@/components/admin/analytics/buy4me-analytics";
import { DriverAnalytics } from "@/components/admin/analytics/driver-analytics";

import { OverviewStats } from "@/components/admin/analytics/overview-stats";
import { RevenueAnalytics } from "@/components/admin/analytics/revenue-analytics";
import { ShipmentAnalytics } from "@/components/admin/analytics/shipment-analytics";
import { SupportAnalytics } from "@/components/admin/analytics/support-analytics";
import { UserAnalytics } from "@/components/admin/analytics/user-analytics";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function AdminAnalyticsDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  //   useEffect(() => {
  //     if (!loading && (!user || user.user_type !== "ADMIN")) {
  //       toast.error("Unauthorized access");
  //       router.push("/");
  //     }
  //   }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  //   if (!user || user.user_type !== "ADMIN") {
  //     return null;
  //   }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for your business
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="buy4me">Buy4Me</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
          <ShipmentAnalytics />
        </TabsContent>

        <TabsContent value="buy4me" className="space-y-4">
          <Buy4MeAnalytics />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueAnalytics />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <DriverAnalytics />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <SupportAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

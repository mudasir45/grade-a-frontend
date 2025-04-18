"use client";

import { ShippingHeader } from "@/components/shipping/header";
import { ShippingShell } from "@/components/shipping/shell";
import {
  ManageShipment,
  ShipmentProps,
} from "@/components/staff/manage-shipment";
import { ShipmentForm } from "@/components/staff/shipment-form";
import { UserShipments } from "@/components/staff/user-shipments";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import {
  CircleCheckBig,
  CircleX,
  History,
  Package,
  PackagePlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("createShipment");
  const { user, getUser, loading, isStaffUser } = useAuth();
  const [shipments, setShipments] = useState<ShipmentProps[]>([]);
  const [users, setUsers] = useState([]);
  const [isCreated, setIsCreated] = useState(false);
  const [total, setTotal] = useState({
    pending: 0,
    cancelled: 0,
    processing: 0,
    delivered: 0,
  });
  const router = useRouter();

  useEffect(() => {
    isStaffUser().then((isStaff) => {
      if (!isStaff) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to access this page",
          variant: "destructive",
        });
        router.push("/");
      }
    });
  }, [isStaffUser]);

  useEffect(() => {
    getUser()
      .then((user) => {
        if (user) {
          // Fetch shipments for the logged-in staff
          const token = localStorage.getItem("auth_token");
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipments/${user.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              setShipments(data);
              setTotal({
                pending: data.filter((d: any) => d.status === "PENDING").length,
                cancelled: data.filter((d: any) => d.status === "CANCELLED")
                  .length,
                processing: data.filter((d: any) => d.status === "PROCESSING")
                  .length,
                delivered: data.filter((d: any) => d.status === "DELIVERED")
                  .length,
              });
            });
          // .catch(error => {
          //   console.error('Failed to fetch shipments:', error)
          //   toast({
          //     title: 'Error',
          //     description: 'Failed to fetch shipments',
          //     variant: 'destructive',
          //   })
          // })
        }
      })
      .catch((error) => {
        console.error("Failed to get user:", error);
      });
  }, []);

  useEffect(() => {
    getUser()
      .then((user) => {
        if (user) {
          // Fetch WALK_IN users
          const token = localStorage.getItem("auth_token");
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/accounts/users/?user_type=WALK_IN`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              setUsers(data.results);
              console.log(data.results);
              console.log("walk in users count: ", data.count);
            });
        }
      })
      .catch((error) => {
        console.error("Failed to get user:", error);
      });
  }, [isCreated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
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
                <div className="text-xs sm:text-sm font-medium">Pending</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {total.pending}
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Processing</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {total.processing}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CircleCheckBig className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Delivered</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {total.delivered}
              </div>
            </Card>
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CircleX className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs sm:text-sm font-medium">Cancelled</div>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-bold">
                {total.cancelled}
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
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger
                  value="createShipment"
                  className="flex items-center gap-2 text-sm"
                >
                  <PackagePlus className="h-4 w-4" />
                  <span>Create Shipment</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manageShipments"
                  className="flex items-center gap-2 text-sm"
                >
                  <Package className="h-4 w-4" />
                  <span>Manage Shipments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="userShipments"
                  className="flex items-center gap-2 text-sm"
                >
                  <Users className="h-4 w-4" />
                  <span>User Shipments</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation */}
            <div className="sm:hidden">
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger
                  value="createShipment"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <PackagePlus className="h-4 w-4" />
                  <span>Create</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manageShipments"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <Package className="h-4 w-4" />
                  <span>Manage</span>
                </TabsTrigger>
                <TabsTrigger
                  value="userShipments"
                  className="flex items-center justify-center gap-1 text-xs"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4 sm:mt-6">
              <TabsContent value="createShipment" className="space-y-4">
                <ShipmentForm users={users} setIsCreated={setIsCreated} />
              </TabsContent>
              <TabsContent value="manageShipments" className="space-y-4">
                <ManageShipment user={user} setTotal={setTotal} />
              </TabsContent>
              <TabsContent value="userShipments" className="space-y-4">
                <UserShipments />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ShippingShell>
  );
}

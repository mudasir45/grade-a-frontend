"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ShipmentData {
  id: string;
  tracking_number: string;
  status: string;
  origin_city?: string;
  destination_city?: string;
  sender_name: string;
  recipient_name: string;
  created_at: string;
  updated_at: string;
}

interface AvailableStatusProps {
  id: number;
  status_type: string;
  status_type_display: string;
  location_name: string;
  description: string;
  display_order: number;
}

export default function PublicShipmentStatusUpdatePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<
    AvailableStatusProps[]
  >([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number>();
  const [description, setDescription] = useState<string>("");
  const { user, loading: userLoading, getUser, setIsOpen } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      // If no user is logged in, redirect to login
      if (!user) {
        setIsOpen(true);
        return;
      }

      // If a specific role is required, check if user has it
      if (user.user_type !== "ADMIN") {
        setIsAuthorized(false);
        toast({
          title: "Error",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        setIsOpen(true);
        // router.push("/");
        return;
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, userLoading, router]);

  // Fetch shipment data
  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("Shipment ID is required");
        }

        const token = localStorage.getItem("auth_token");
        const currentUser = await getUser();

        if (!currentUser) {
          throw new Error("User not authenticated");
        }

        // Fetch shipment details
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipments/staff-shipments/${currentUser.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch shipments");
        }

        const allShipments = await response.json();
        const currentShipment = allShipments.find(
          (shipment: any) => shipment.id === id
        );

        if (!currentShipment) {
          throw new Error("Shipment not found");
        }

        setShipment(currentShipment);

        // Fetch available statuses for this shipment
        const statusData = await ShippingAPI.getShipmentStatusLocations(
          id as string
        );
        setAvailableStatuses(statusData.available_status_locations);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch shipment"
        );
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch shipment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShipment();
    }
  }, [id, user]);

  const handleUpdateStatus = async () => {
    if (!selectedStatusId) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      // Update shipment status using the ShippingAPI
      await ShippingAPI.updateShipmentStatusLocation(
        id as string,
        selectedStatusId,
        description
      );

      toast({
        title: "Success",
        description: "Shipment status updated successfully",
      });

      // Navigate back to tracking page with correct query parameter
      router.push(`/tracking?tracking_number=${shipment?.tracking_number}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-500">{status}</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500">{status}</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center">
          <Truck className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-xl font-semibold text-primary">
            Grade-A Express
          </h2>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Shipment Status
          </CardTitle>
          <CardDescription>
            Update the status for shipment #{shipment?.tracking_number}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          ) : shipment ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Tracking Number</h3>
                  <p className="text-sm">{shipment.tracking_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Current Status</h3>
                  <p className="text-sm">{getStatusBadge(shipment.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">From</h3>
                  <p className="text-sm">{shipment.sender_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">To</h3>
                  <p className="text-sm">{shipment.recipient_name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select
                    onValueChange={(value) =>
                      setSelectedStatusId(Number(value))
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status.id} value={String(status.id)}>
                          <span className="flex items-center gap-2">
                            <span>{status.status_type}</span>
                            <span className="text-xs text-gray-500">
                              ({status.location_name})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter any additional information about this status update"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>No shipment found with the provided ID.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/tracking")}
              >
                Go to Tracking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

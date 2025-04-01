"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShipmentDetailsDialog from "@/components/ui/shipment-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDriverShipments,
  useUpdateShipmentStatus,
} from "@/hooks/use-driver";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, DollarSign, MapPin, Package, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShipmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const {
    data: shipments,
    isLoading,
    error,
  } = useDriverShipments({ status: statusFilter });
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [selectedStatusLocation, setSelectedStatusLocation] = useState<
    number | null
  >(null);
  const [customDescription, setCustomDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableStatusLocations, setAvailableStatusLocations] = useState<
    any[]
  >([]);
  const updateStatusMutation = useUpdateShipmentStatus();

  // Add states for viewing shipment details
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);

  const handleStatusUpdate = async () => {
    if (!selectedShipment || !selectedStatusLocation) return;

    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: selectedShipment,
        data: {
          status_location_id: selectedStatusLocation,
          custom_description: customDescription,
        },
      });

      toast.success("Shipment status updated successfully");
      setIsDialogOpen(false);
      setSelectedShipment(null);
      setSelectedStatusLocation(null);
      setCustomDescription("");
    } catch (error) {
      toast.error("Failed to update shipment status");
    }
  };

  const handleOpenStatusDialog = async (shipmentId: string) => {
    setSelectedShipment(shipmentId);

    try {
      // In a real implementation, you would fetch the available status locations
      // from the API based on the shipment ID
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/driver/shipments/${shipmentId}/update/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      const data = await response.json();
      setAvailableStatusLocations(data.available_status_locations || []);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch status options");
    }
  };

  // Add function to handle viewing details
  const handleViewDetails = (shipment: any) => {
    setShipmentDetails(shipment);
    setViewDetailsOpen(true);
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

  if (isLoading) {
    return <ShipmentsSkeleton />;
  }

  if (error || !shipments) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load shipments</p>
      </div>
    );
  }

  // Handle the paginated response structure
  const shipmentsData = Array.isArray(shipments)
    ? shipments
    : shipments.results || [];

  const pendingShipments = shipmentsData.filter((s: any) =>
    [
      "PENDING",
      "PROCESSING",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
    ].includes(s.status)
  );

  const completedShipments = shipmentsData.filter((s: any) =>
    ["DELIVERED", "COMPLETED"].includes(s.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Manage your assigned shipments and deliveries
          </p>
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PICKED_UP">Picked Up</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({pendingShipments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedShipments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {pendingShipments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <Package className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No active shipments found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingShipments.map((shipment: any) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onUpdateStatus={handleOpenStatusDialog}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedShipments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <Package className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No completed shipments found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedShipments.map((shipment: any) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onUpdateStatus={handleOpenStatusDialog}
                  isCompleted
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>
              Select a new status for this shipment
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                value={selectedStatusLocation?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedStatusLocation(Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatusLocations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.status_type_display} - {location.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Textarea
                placeholder="Add a description (optional)"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedShipment(null);
                setSelectedStatusLocation(null);
                setCustomDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                !selectedStatusLocation || updateStatusMutation.isPending
              }
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add ShipmentDetailsDialog */}
      {shipmentDetails && (
        <ShipmentDetailsDialog
          viewDialogOpen={viewDetailsOpen}
          setViewDialogOpen={setViewDetailsOpen}
          selectedShipment={shipmentDetails}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}

interface ShipmentCardProps {
  shipment: any;
  onUpdateStatus: (id: string) => void;
  isCompleted?: boolean;
  onViewDetails?: (shipment: any) => void;
}

function ShipmentCard({
  shipment,
  onUpdateStatus,
  isCompleted = false,
  onViewDetails,
}: ShipmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {shipment.tracking_number}
            </CardTitle>
            <CardDescription>{formatDate(shipment.created_at)}</CardDescription>
          </div>
          <Badge className={getStatusColor(shipment.status)}>
            {shipment.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{shipment.customer_name}</p>
            <p className="text-xs text-muted-foreground">
              {shipment.customer_phone}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Pickup</p>
            <p className="text-xs text-muted-foreground">
              {shipment.sender_address}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Delivery</p>
            <p className="text-xs text-muted-foreground">
              {shipment.recipient_address}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">
              {shipment.current_location || "Not updated"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium">Amount</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(shipment.total_cost)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {!isCompleted && (
          <Button
            className="w-full"
            onClick={() => onUpdateStatus(shipment.id)}
          >
            Update Status
          </Button>
        )}
        {isCompleted && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onUpdateStatus(shipment.id)}
          >
            View Status History
          </Button>
        )}
        <Button
          className="w-full"
          variant={isCompleted ? "outline" : "secondary"}
          onClick={() => onViewDetails && onViewDetails(shipment)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function ShipmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array(5)
                      .fill(null)
                      .map((_, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Skeleton className="h-4 w-4 mt-0.5" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-full mt-1" />
                          </div>
                        </div>
                      ))}
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/driver/shipments/${shipmentId}/update/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      const data = await response.json();

      // Filter status locations to only show allowed statuses for drivers
      const allowedStatuses = [
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "FAILED_DELIVERY",
        "RETURNED",
      ];
      const filteredStatusLocations =
        data.available_status_locations?.filter((location: any) =>
          allowedStatuses.includes(location.status_type)
        ) || [];

      setAvailableStatusLocations(filteredStatusLocations);
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
      case "OUT_FOR_DELIVERY":
        return <Badge className="bg-indigo-500">{status}</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">{status}</Badge>;
      case "FAILED_DELIVERY":
        return <Badge className="bg-orange-500">{status}</Badge>;
      case "RETURNED":
        return <Badge className="bg-purple-500">{status}</Badge>;
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
      "CANCELLED",
      "FAILED_DELIVERY",
      "RETURNED",
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
            <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FAILED_DELIVERY">Failed Delivery</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
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
              Select the current status of this delivery
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableStatusLocations.length === 0 ? (
              <div className="text-center p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  No valid status options available for this shipment.
                </p>
              </div>
            ) : (
              <>
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
                          {location.status_type_display} -{" "}
                          {location.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs text-muted-foreground">
                    <p className="mt-1">
                      <strong>Important:</strong> Only update the status when
                      you have completed the corresponding action.
                    </p>
                    <ul className="mt-2 pl-4 list-disc">
                      <li>
                        Use "Out for Delivery" when you start your delivery
                        route
                      </li>
                      <li>
                        Use "Delivered" only after successful delivery to the
                        recipient
                      </li>
                      <li>
                        Use "Failed Delivery" if you couldn't complete the
                        delivery
                      </li>
                      <li>Use "Cancelled" only if instructed by management</li>
                      <li>
                        Use "Returned" when the package is being returned to the
                        sender
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Textarea
                    placeholder="Add details about the delivery (required for Failed Delivery)"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                  />
                </div>
              </>
            )}
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
                !selectedStatusLocation ||
                updateStatusMutation.isPending ||
                (selectedStatusLocation !== null &&
                  availableStatusLocations.some(
                    (loc) =>
                      loc.id === selectedStatusLocation &&
                      loc.status_type === "FAILED_DELIVERY" &&
                      !customDescription.trim()
                  ))
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
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      case "FAILED_DELIVERY":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "RETURNED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "PICKED_UP":
        return <Package className="h-3 w-3" />;
      case "IN_TRANSIT":
        return <Package className="h-3 w-3" />;
      case "OUT_FOR_DELIVERY":
        return <MapPin className="h-3 w-3" />;
      case "DELIVERED":
      case "COMPLETED":
        return <Package className="h-3 w-3" />;
      case "CANCELLED":
        return <Clock className="h-3 w-3" />;
      case "FAILED_DELIVERY":
        return <MapPin className="h-3 w-3" />;
      case "RETURNED":
        return <Package className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Status indicator at the top */}
      <div
        className={`h-1 w-full ${
          getStatusColor(shipment.status).split(" ")[0]
        }`}
      />

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-1">
              <Package className="h-4 w-4 text-primary" />
              {shipment.tracking_number}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Created: {formatDate(shipment.created_at)}
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(
              shipment.status
            )} flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border`}
          >
            {getStatusIcon(shipment.status)}
            {shipment.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        {/* Customer Information */}
        <div className="p-3 bg-muted/40 rounded-lg">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{shipment.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {shipment.customer_phone}
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-blue-600" />
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-700">From</p>
              <p className="text-xs text-muted-foreground">
                {shipment.sender_address}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-4 w-4 rounded-full bg-green-100 items-center justify-center">
              <MapPin className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-green-700">To</p>
              <p className="text-xs text-muted-foreground">
                {shipment.recipient_address}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium leading-none">Location</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {shipment.current_location || "Not updated"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs font-medium leading-none">Amount</p>
              <p className="text-xs font-semibold text-emerald-600 mt-1">
                {formatCurrency(shipment.total_cost)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2 border-t bg-muted/10">
        {!isCompleted ? (
          <Button
            className="w-full flex items-center gap-1"
            size="sm"
            onClick={() => onUpdateStatus(shipment.id)}
          >
            <Clock className="h-3.5 w-3.5" />
            Update Status
          </Button>
        ) : (
          <Button
            className="w-full flex items-center gap-1"
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(shipment.id)}
          >
            <Clock className="h-3.5 w-3.5" />
            Status History
          </Button>
        )}
        <Button
          className="w-full flex items-center gap-1"
          variant={isCompleted ? "outline" : "secondary"}
          size="sm"
          onClick={() => onViewDetails && onViewDetails(shipment)}
        >
          <Package className="h-3.5 w-3.5" />
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
                <Card key={i} className="overflow-hidden">
                  {/* Status indicator */}
                  <div className="h-1 w-full bg-gray-200" />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-md" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-2">
                    {/* Customer Card */}
                    <div className="p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-full mt-1" />
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <div className="flex-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-full mt-1" />
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20 mt-1" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-12 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-2 border-t bg-muted/10">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

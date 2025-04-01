"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { NewShipmentResponse } from "@/lib/types/shipping";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";

interface ShipmentDetailsDialogProps {
  shipment: NewShipmentResponse;
  open: boolean;
  onClose: () => void;
}

export function ShipmentDetailsDialog({
  shipment,
  open,
  onClose,
}: ShipmentDetailsDialogProps) {
  //   const { data: shipment, isLoading, error } = useShipmentDetails(shipmentId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_TRANSIT":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED_DELIVERY":
        return "bg-red-100 text-red-800 border-red-200";
      case "COD_PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "COD_PAID":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  //   if (isLoading) {
  //     return (
  //       <Dialog open={open} onOpenChange={onClose}>
  //         <DialogContent className="sm:max-w-[600px]">
  //           <div className="flex items-center justify-center py-12">
  //             <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //           </div>
  //         </DialogContent>
  //       </Dialog>
  //     );
  //   }

  //   if (error || !shipment) {
  //     return (
  //       <Dialog open={open} onOpenChange={onClose}>
  //         <DialogContent className="sm:max-w-[600px]">
  //           <DialogHeader>
  //             <DialogTitle>Error</DialogTitle>
  //             <DialogDescription>
  //               Failed to load shipment details. Please try again.
  //             </DialogDescription>
  //           </DialogHeader>
  //           <DialogFooter>
  //             <Button onClick={onClose}>Close</Button>
  //           </DialogFooter>
  //         </DialogContent>
  //       </Dialog>
  //     );
  //   }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipment Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this shipment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shipment Identifier Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                #{shipment.tracking_number}
              </h3>
              <Badge className={getStatusColor(shipment.status)}>
                {formatStatus(shipment.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              <Calendar className="inline h-4 w-4 mr-1" />
              Created on {formatDate(shipment.created_at)}
            </p>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="font-medium">1. Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  {shipment.sender_name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>{shipment.customer_phone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-3">
            <h4 className="font-medium">2. Location Information</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pickup Address</p>
                <p className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-primary mt-1 shrink-0" />
                  <span>{shipment.pickup_address || "N/A"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Delivery Address
                </p>
                <p className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-green-600 mt-1 shrink-0" />
                  <span>{shipment.delivery_address || "N/A"}</span>
                </p>
              </div>

              {shipment.current_location && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Location
                  </p>
                  <p className="flex items-start">
                    <Truck className="h-4 w-4 mr-2 text-blue-600 mt-1 shrink-0" />
                    <span>{shipment.current_location}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h4 className="font-medium">3. Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="flex items-center font-semibold">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  {formatCurrency(
                    parseFloat(shipment.total_cost || shipment.amount || "0")
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p>
                  {shipment.payment_status ? (
                    <Badge className={getStatusColor(shipment.payment_status)}>
                      {formatStatus(shipment.payment_status)}
                    </Badge>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          {shipment.items && shipment.items.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">4. Package Details</h4>
              <div className="space-y-2">
                {shipment.items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {item.name || `Item ${index + 1}`}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Quantity:{" "}
                          <span className="font-medium">
                            {item.quantity || 1}
                          </span>
                        </p>
                        {item.weight && (
                          <p className="text-sm">
                            Weight:{" "}
                            <span className="font-medium">
                              {item.weight} kg
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking History */}
          {shipment.tracking_history &&
            shipment.tracking_history.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">5. Tracking History</h4>
                <div className="space-y-2">
                  {shipment.tracking_history.map(
                    (event: any, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-4 border-l border-gray-200"
                      >
                        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary"></div>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {event.status ||
                              formatStatus(
                                event.status_type || "STATUS_UPDATE"
                              )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.location ||
                              event.description ||
                              "Location not specified"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(event.timestamp || event.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

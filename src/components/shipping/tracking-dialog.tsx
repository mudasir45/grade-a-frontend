"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShippingAPI } from "@/lib/api/shipping";
import { NewShipmentResponse } from "@/lib/types/shipping";
import { formatDate } from "@/lib/utils";
import { Loader2, Package, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TrackingDialogProps {
  trackingNumber: string;
  open: boolean;
  shipment: NewShipmentResponse | null;
  onClose: () => void;
}

export function TrackingDialog({
  trackingNumber,
  shipment,
  open,
  onClose,
}: TrackingDialogProps) {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    if (open && trackingNumber) {
      fetchTrackingData();
    }
  }, [open, trackingNumber]);

  const fetchTrackingData = async () => {
    try {
      const data = await ShippingAPI.trackShipment(trackingNumber);
      setTrackingData(data);
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipment Tracking
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trackingData ? (
          <div className="space-y-6">
            {/* Tracking Number and Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-medium">{shipment?.tracking_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{shipment?.status}</p>
              </div>
            </div>

            {/* Current Location and Estimated Delivery */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{shipment?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <p className="font-medium">
                    {shipment?.payment_status || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{trackingData.current_location}</p>
                </div>
                {shipment?.estimated_delivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {formatDate(shipment?.estimated_delivery)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-3">Shipment Details</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{shipment?.sender_name}</p>
                  <p className="text-sm">{shipment?.sender_address}</p>
                  <p className="text-sm">{shipment?.sender_country}</p>
                  <p className="text-sm">{shipment?.sender_email}</p>
                  <p className="text-sm">{shipment?.sender_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{shipment?.recipient_name}</p>
                  <p className="text-sm">{shipment?.recipient_address}</p>
                  <p className="text-sm">{shipment?.recipient_country}</p>
                  <p className="text-sm">{shipment?.recipient_email}</p>
                  <p className="text-sm">{shipment?.recipient_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Package Details
                  </p>
                  <p className="font-medium">{shipment?.package_type}</p>
                  <p className="text-sm">Weight: {shipment?.weight} kg</p>
                  <p className="text-sm">
                    Dimensions: {shipment?.length}x{shipment?.width}x
                    {shipment?.height} cm
                  </p>
                  <p className="text-sm">
                    Declared Value: ${shipment?.declared_value}
                  </p>
                  <p className="text-sm">{shipment?.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Service Details
                  </p>
                  <p className="font-medium capitalize">
                    {shipment?.service_type}
                  </p>
                  <p className="text-sm">
                    Insurance:{" "}
                    {shipment?.insurance_required ? "Required" : "Not Required"}
                  </p>
                  <p className="text-sm">
                    Signature:{" "}
                    {shipment?.signature_required ? "Required" : "Not Required"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-3">Cost Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">
                    City Delivery Charge
                  </p>
                  <p className="font-medium">RM {shipment?.delivery_charge}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Per KG Rate</p>
                  <p className="font-medium">RM {shipment?.per_kg_rate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight Charge</p>
                  <p className="font-medium">RM {shipment?.weight_charge}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Service Charge
                  </p>
                  <p className="font-medium">RM {shipment?.service_charge}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Additional Charges
                  </p>
                  <p className="font-medium">
                    RM {shipment?.total_additional_charges}
                  </p>
                </div>
                <div className="p-2 border rounded bg-background">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-medium text-lg">
                    RM {shipment?.total_cost}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div>
              <h3 className="text-sm font-medium mb-3">Tracking History</h3>
              <div className="space-y-4">
                {trackingData.tracking_history.map(
                  (event: any, index: number) => (
                    <div
                      key={index}
                      className="relative pl-6 pb-4 border-l-2 border-muted-foreground last:border-l-0"
                    >
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-muted-foreground" />
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        <span>{event.location}</span>
                        <span>•</span>
                        <span>{formatDate(event.timestamp)}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No tracking information available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

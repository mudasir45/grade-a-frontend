"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShippingAPI } from "@/lib/api/shipping";
import { formatDate } from "@/lib/utils";
import { Loader2, Package, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TrackingDialogProps {
  trackingNumber: string;
  open: boolean;
  onClose: () => void;
}

export function TrackingDialog({
  trackingNumber,
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
                <p className="font-medium">{trackingData.tracking_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{trackingData.status}</p>
              </div>
            </div>

            {/* Current Location and Estimated Delivery */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{trackingData.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <p className="font-medium">
                    {trackingData.payment_status || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{trackingData.current_location}</p>
                </div>
                {trackingData.estimated_delivery && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Delivery
                    </p>
                    <p className="font-medium">
                      {formatDate(trackingData.estimated_delivery)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipment Details */}
            <div>
              <h3 className="text-sm font-medium mb-3">Shipment Details</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">
                    {trackingData.shipment_details.origin.name}
                  </p>
                  <p className="text-sm">
                    {trackingData.shipment_details.origin.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">
                    {trackingData.shipment_details.destination.name}
                  </p>
                  <p className="text-sm">
                    {trackingData.shipment_details.destination.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium capitalize">
                    {trackingData.shipment_details.service}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Package Details
                  </p>
                  <p className="font-medium">
                    {trackingData.shipment_details.package.weight}kg,
                    {trackingData.shipment_details.package.dimensions.length}x
                    {trackingData.shipment_details.package.dimensions.width}x
                    {trackingData.shipment_details.package.dimensions.height}cm
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

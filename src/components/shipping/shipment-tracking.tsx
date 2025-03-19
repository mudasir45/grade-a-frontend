"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { formatDate } from "@/lib/utils";
import { Package, Search } from "lucide-react";
import { useState } from "react";

export function ShipmentTracking({
  IncomingTrackingNumber,
}: {
  IncomingTrackingNumber?: string;
}) {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState(
    IncomingTrackingNumber || ""
  );
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast({
        title: "Missing Tracking Number",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await ShippingAPI.trackShipment(trackingNumber);
      setTrackingData(data);
    } catch (error) {
      toast({
        title: "Tracking Failed",
        description:
          error instanceof Error ? error.message : "Failed to track shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleTrack} className="flex gap-4">
        <Input
          placeholder="Enter tracking number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            "Tracking..."
          ) : (
            <>
              Track
              <Search className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {trackingData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tracking Details
            </CardTitle>
            <CardDescription>
              Tracking Number: {trackingData.tracking_number}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{trackingData.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{trackingData.current_location}</p>
                </div>
                {trackingData.estimated_delivery && (
                  <div className="col-span-2">
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
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Shipment Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium capitalize">
                    {trackingData.shipment_details.service}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">
                    {trackingData.shipment_details.package.weight}kg,
                    {trackingData.shipment_details.package.dimensions.length}x
                    {trackingData.shipment_details.package.dimensions.width}x
                    {trackingData.shipment_details.package.dimensions.height}cm
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div>
              <h3 className="font-semibold mb-4">Tracking History</h3>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

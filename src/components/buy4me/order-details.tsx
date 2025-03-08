"use client";

import { OrderTracking } from "@/components/buy4me/order-tracking";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Truck } from "lucide-react";
import { useState } from "react";

interface OrderDetailsProps {
  order: any;
  open: boolean;
  onClose: () => void;
}

export function OrderDetails({ order, open, onClose }: OrderDetailsProps) {
  const [requestShipping, setRequestShipping] = useState(false);

  const handleRequestShipping = () => {
    setRequestShipping(true);
    // In a real app, this would make an API call to request shipping
    setTimeout(() => {
      setRequestShipping(false);
      onClose();
    }, 2000);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order ID: {order.id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Order Status */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <OrderTracking order={order} />
          </div>

          {/* Order Items */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-2 rounded-lg border"
                  >
                    <div className="h-16 w-16 rounded-md overflow-hidden">
                      <img
                        src={item.product_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in this order.</p>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Products Total</span>
                <span>{formatCurrency(order.total_cost)}</span>
              </div>
              {/* Add more cost breakdown items as needed */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            {order.status === "warehouse" && (
              <Button
                onClick={handleRequestShipping}
                disabled={requestShipping}
              >
                <Truck className="mr-2 h-4 w-4" />
                {requestShipping ? "Requesting..." : "Request Shipping"}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

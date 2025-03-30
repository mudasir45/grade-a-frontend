"use client";

import { OrderTracking } from "@/components/buy4me/order-tracking";
import { OrderStatusBadge } from "@/components/buy4me/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, MapPin, Package, Truck } from "lucide-react";
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

  // Calculate totals
  const itemsTotal = order.items.reduce(
    (sum: number, item: any) =>
      sum + parseFloat(item.unit_price) * item.quantity,
    0
  );

  const deliveryChargesTotal = order.items.reduce(
    (sum: number, item: any) =>
      sum + parseFloat(item.store_to_warehouse_delivery_charge || "0"),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </DialogTitle>
          <DialogDescription className="flex flex-col sm:flex-row gap-4 justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Order ID:</span>
              <span className="font-mono">{order.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(order.created_at)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Order Status */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">1</span>
              </span>
              Status
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Current Status:
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderTracking order={order} />
          </div>

          {/* Order Items */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">2</span>
              </span>
              Products
            </h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{item.product_name}</h4>
                      <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-x-8 gap-y-1">
                        <div>Quantity: {item.quantity}</div>
                        <div>Price: {formatCurrency(item.unit_price)}</div>
                        {item.color && <div>Color: {item.color}</div>}
                        {item.size && <div>Size: {item.size}</div>}
                        <div>
                          Delivery:{" "}
                          {formatCurrency(
                            item.store_to_warehouse_delivery_charge || "0"
                          )}
                        </div>
                        <div className="font-semibold text-foreground">
                          Subtotal:{" "}
                          {formatCurrency(
                            parseFloat(item.unit_price) * item.quantity +
                              parseFloat(
                                item.store_to_warehouse_delivery_charge || "0"
                              )
                          )}
                        </div>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="w-full sm:w-auto mt-2 sm:mt-0 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Notes:</span> {item.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No items in this order.</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">3</span>
              </span>
              Shipping Details
            </h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs text-primary font-bold">4</span>
              </span>
              <DollarSign className="h-5 w-5" />
              Cost Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Products Total</span>
                <span>{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>{formatCurrency(deliveryChargesTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>
                  {formatCurrency(
                    parseFloat(order.total_cost) -
                      itemsTotal -
                      deliveryChargesTotal
                  )}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total_cost)}</span>
              </div>
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

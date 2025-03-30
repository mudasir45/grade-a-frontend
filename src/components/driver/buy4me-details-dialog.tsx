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
import { useBuy4meOrderDetails } from "@/hooks/use-driver";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

interface Buy4meDetailsDialogProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function Buy4meDetailsDialog({
  orderId,
  open,
  onClose,
}: Buy4meDetailsDialogProps) {
  const { data: order, isLoading, error } = useBuy4meOrderDetails(orderId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "SUBMITTED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ORDER_PLACED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHOPPING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PURCHASED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DELIVERING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !order) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load Buy4Me order details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Buy4Me Order Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this Buy4Me order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Identifier Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Order #{order.id.substring(0, 8)}
              </h3>
              <Badge className={getStatusColor(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              <Calendar className="inline h-4 w-4 mr-1" />
              Created on {formatDate(order.created_at)}
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
                  {order.user_name || order.user_details?.full_name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>
                  {order.user_phone ||
                    order.user_details?.phone_number ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="space-y-3">
              <h4 className="font-medium">2. Shipping Information</h4>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Shipping Address
                </p>
                <p className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-primary mt-1 shrink-0" />
                  <span>{order.shipping_address}</span>
                </p>
              </div>

              {order.current_location && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Location
                  </p>
                  <p className="flex items-start">
                    <Truck className="h-4 w-4 mr-2 text-blue-600 mt-1 shrink-0" />
                    <span>{order.current_location}</span>
                  </p>
                </div>
              )}

              {order.city_details && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">City</p>
                  <p>{order.city_details.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-medium">3. Order Items</h4>
            <div className="space-y-3">
              {(order.items || []).map((item: any, index: number) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_url && (
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View product link
                        </a>
                      )}
                      {(item.color || item.size) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {[
                            item.color && `Color: ${item.color}`,
                            item.size && `Size: ${item.size}`,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(
                          parseFloat(item.unit_price) * item.quantity
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(parseFloat(item.unit_price))} x{" "}
                        {item.quantity}
                      </p>
                      {item.store_to_warehouse_delivery_charge && (
                        <p className="text-xs text-muted-foreground">
                          Delivery:{" "}
                          {formatCurrency(
                            parseFloat(item.store_to_warehouse_delivery_charge)
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h4 className="font-medium">4. Payment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="flex items-center font-semibold">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  {formatCurrency(parseFloat(order.total_cost || "0"))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p>
                  {order.payment_status ? (
                    <Badge className={getStatusColor(order.payment_status)}>
                      {formatStatus(order.payment_status)}
                    </Badge>
                  ) : (
                    <Badge>Unknown</Badge>
                  )}
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border rounded-md p-3 space-y-2 mt-2">
              <p className="font-medium">Cost Breakdown</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Products Total</span>
                  <span>{formatCurrency(calculateProductsTotal(order))}</span>
                </div>
                {calculateDeliveryCharges(order) > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>
                      {formatCurrency(calculateDeliveryCharges(order))}
                    </span>
                  </div>
                )}
                {order.city_details?.delivery_charge && (
                  <div className="flex justify-between">
                    <span>City Delivery Charge</span>
                    <span>
                      {formatCurrency(
                        parseFloat(order.city_details.delivery_charge)
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-1 border-t mt-1">
                  <span>Total</span>
                  <span>
                    {formatCurrency(parseFloat(order.total_cost || "0"))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">5. Status History</h4>
              <div className="space-y-2">
                {order.status_history.map((event: any, index: number) => (
                  <div
                    key={index}
                    className="relative pl-6 pb-4 border-l border-gray-200"
                  >
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary"></div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {formatStatus(event.status || "STATUS_UPDATE")}
                      </p>
                      {event.notes && (
                        <p className="text-sm text-muted-foreground">
                          {event.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.timestamp || event.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
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

// Helper functions for calculations
function calculateProductsTotal(order: any): number {
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return 0;
  }

  return order.items.reduce((total: number, item: any) => {
    return total + parseFloat(item.unit_price) * item.quantity;
  }, 0);
}

function calculateDeliveryCharges(order: any): number {
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return 0;
  }

  return order.items.reduce((total: number, item: any) => {
    return (
      total +
      (item.store_to_warehouse_delivery_charge
        ? parseFloat(item.store_to_warehouse_delivery_charge)
        : 0)
    );
  }, 0);
}

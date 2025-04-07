"use client";

import { OrderTracking } from "@/components/buy4me/order-tracking";
import { OrderStatusBadge } from "@/components/buy4me/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Info,
  Landmark,
  Loader2,
  MapPin,
  Package,
  Printer,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useState } from "react";

interface OrderDetailsProps {
  order: any;
  open: boolean;
  onClose: () => void;
}

export function OrderDetails({ order, open, onClose }: OrderDetailsProps) {
  const [requestShipping, setRequestShipping] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleRequestShipping = () => {
    setRequestShipping(true);
    // In a real app, this would make an API call to request shipping
    setTimeout(() => {
      setRequestShipping(false);
      onClose();
    }, 2000);
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleCopyOrderDetails = () => {
    const details = `
Order ID: ${order.id}
Date: ${formatDate(order.created_at)}
Status: ${order.status}
Total: ${formatCurrency(order.total_cost)}
Shipping Address: ${order.shipping_address}
    `;

    navigator.clipboard
      .writeText(details)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Order details have been copied to clipboard",
        });
      })
      .catch((err) => {
        toast({
          title: "Failed to copy",
          description: "Could not copy order details to clipboard",
          variant: "destructive",
        });
        console.error("Could not copy text: ", err);
      });
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

  // Get estimated delivery date (mock data)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  Order Details
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={handlePrintOrder}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print Order</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={handleCopyOrderDetails}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Order Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <DialogDescription className="flex flex-col sm:flex-row items-start flex-wrap gap-2 sm:gap-3 pt-2">
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    ID:
                  </span>
                  <span className="font-mono text-xs">{order.id}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div className="ml-auto">
                  <OrderStatusBadge
                    status={order.status}
                    className="text-sm px-3 py-1.5"
                  />
                </div>
              </DialogDescription>
            </DialogHeader>

            <Tabs
              defaultValue="details"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tracking"
                  className="flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  <span>Tracking</span>
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Cost Summary</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-700">
                      Estimated Delivery Date
                    </h4>
                    <p className="text-sm text-yellow-600">
                      Your order is expected to arrive by{" "}
                      {formatDate(estimatedDelivery.toISOString())}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <motion.div
                  className="rounded-xl border overflow-hidden bg-card shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-muted/50 p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <span>Products</span>
                      <Badge variant="outline" className="ml-auto">
                        {order.items?.length || 0} items
                      </Badge>
                    </h3>
                  </div>

                  <div className="divide-y">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any, index: number) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + index * 0.05 }}
                          className="p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Box className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h4 className="font-medium text-base">
                                  {item.product_name}
                                </h4>
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                  <span>Subtotal:</span>
                                  <span>
                                    {formatCurrency(
                                      parseFloat(item.unit_price) *
                                        item.quantity +
                                        parseFloat(
                                          item.store_to_warehouse_delivery_charge ||
                                            "0"
                                        )
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Quantity:
                                  </span>
                                  <span className="font-medium">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Price:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(item.unit_price)}
                                  </span>
                                </div>
                                {item.color && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      Color:
                                    </span>
                                    <span className="font-medium">
                                      {item.color}
                                    </span>
                                  </div>
                                )}
                                {item.size && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      Size:
                                    </span>
                                    <span className="font-medium">
                                      {item.size}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Delivery:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      item.store_to_warehouse_delivery_charge ||
                                        "0"
                                    )}
                                  </span>
                                </div>
                              </div>
                              {item.notes && (
                                <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No items in this order.</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  className="rounded-xl border overflow-hidden bg-card shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-muted/50 p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Shipping Details</span>
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                          {order.shipping_address}
                        </p>
                        <div className="mt-4 inline-flex">
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              order.shipping_address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            View on map <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="tracking" className="mt-4">
                <div className="bg-card border rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Order Progress</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <OrderTracking order={order} />
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <motion.div
                  className="rounded-xl border overflow-hidden bg-card shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-muted/50 p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span>Cost Breakdown</span>
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 max-w-md mx-auto">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Product Charges
                        </h4>
                        <div className="space-y-2">
                          {order.items &&
                            order.items.map((item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/30"
                              >
                                <span className="truncate max-w-[200px]">
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    parseFloat(item.unit_price) * item.quantity
                                  )}
                                </span>
                              </div>
                            ))}
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>Products Subtotal</span>
                            <span>{formatCurrency(itemsTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Delivery Charges
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>Store to Warehouse</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(deliveryChargesTotal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Landmark className="h-4 w-4 text-muted-foreground" />
                              <span>City Delivery</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(
                                parseFloat(order.city_delivery_charge)
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>Delivery Subtotal</span>
                            <span>
                              {formatCurrency(
                                deliveryChargesTotal +
                                  parseFloat(order.city_delivery_charge)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between font-semibold bg-primary/10 py-4 px-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          <span className="text-base">Total Amount</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg text-primary">
                            {formatCurrency(order.total_cost)}
                          </span>
                          <div className="text-xs text-muted-foreground mt-1">
                            Tax included
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-green-700">
                          <p className="font-medium">Payment completed</p>
                          <p>Your payment has been processed successfully.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <motion.div
              className="flex justify-end gap-4 mt-4 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {order.status === "warehouse" && (
                <Button
                  onClick={handleRequestShipping}
                  disabled={requestShipping}
                  className="gap-2"
                >
                  {requestShipping ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      Request Shipping
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Close
              </Button>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Buy4meDetailsDialog } from "@/components/driver/buy4me-details-dialog";
import BizapayPaymentForm from "@/components/payment/bizapay-for-driver";
import PaymentModal from "@/components/payment/PaymentForm";
import { ShipmentProps } from "@/components/staff/manage-shipment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ShipmentDetailsDialog from "@/components/ui/shipment-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBulkPayment,
  useDriverBuy4meOrders,
  useDriverShipments,
} from "@/hooks/use-driver";
import { convertCurrency, formatCurrency, formatDate } from "@/lib/utils";
import { Check, Loader2, PackageCheck, ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DriverPaymentPage() {
  const [activeTab, setActiveTab] = React.useState<"shipments" | "buy4me">(
    "shipments"
  );
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedBuy4MeIds, setSelectedBuy4MeIds] = React.useState<string[]>(
    []
  );
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [convertingCurrency, setConvertingCurrency] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentProps | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState<string | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);

  // Queries for shipments and buy4me requests with pending status
  const { data: shipments, isLoading: shipmentsLoading } = useDriverShipments({
    status: "PENDING",
  });

  const { data: buy4meOrders, isLoading: buy4meLoading } =
    useDriverBuy4meOrders({
      status: "PENDING",
    });

  const bulkPaymentMutation = useBulkPayment();

  // Filter for COD payments in code since API might not support it directly
  const shipmentsData = React.useMemo(() => {
    const data = Array.isArray(shipments)
      ? shipments
      : shipments?.results || [];
    // Filter for COD_PENDING in payment_status if available, otherwise use all pending
    return data.filter(
      (s: any) =>
        !s.payment_status ||
        s.payment_status === "COD_PENDING" ||
        s.payment_status === "PENDING"
    );
  }, [shipments]);

  const buy4meData = React.useMemo(() => {
    const data = Array.isArray(buy4meOrders)
      ? buy4meOrders
      : buy4meOrders?.results || [];
    // Filter for COD_PENDING in payment_status if available, otherwise use all pending
    return data.filter(
      (o: any) =>
        !o.payment_status ||
        o.payment_status === "COD_PENDING" ||
        o.payment_status === "PENDING"
    );
  }, [buy4meOrders]);

  // Add debugging right after fetching data
  useEffect(() => {
    console.log("Shipments data:", shipments);
    console.log("Buy4Me data:", buy4meOrders);
  }, [shipments, buy4meOrders]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as "shipments" | "buy4me");
  };

  const getStatusBadge = (status: any) => {
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

  // Handle select all for shipments
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(shipmentsData.map((shipment: any) => shipment.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle select all for Buy4Me
  const handleSelectAllBuy4Me = (checked: boolean) => {
    if (checked) {
      setSelectedBuy4MeIds(buy4meData.map((order: any) => order.id));
    } else {
      setSelectedBuy4MeIds([]);
    }
  };

  // Toggle selection for a specific shipment
  const handleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((shipmentId) => shipmentId !== id)
        : [...prev, id]
    );
  };

  // Toggle selection for a specific Buy4Me order
  const toggleBuy4MeSelection = (id: string) => {
    setSelectedBuy4MeIds((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id]
    );
  };

  // Calculate the total cost of selected items
  React.useEffect(() => {
    let total = 0;

    // Add selected shipment costs
    selectedIds.forEach((id) => {
      const shipment = shipmentsData.find((s: any) => s.id === id);
      if (shipment) {
        total += parseFloat(shipment.total_cost || "0");
      }
    });

    // Add selected Buy4Me costs
    selectedBuy4MeIds.forEach((id) => {
      const order = buy4meData.find((o: any) => o.id === id);
      if (order) {
        total += parseFloat(order.total_cost || "0");
      }
    });

    console.log("Total calculated:", total);
    console.log("Selected shipment IDs:", selectedIds);
    console.log("Selected Buy4Me IDs:", selectedBuy4MeIds);

    setTotalAmount(total);
    // Convert to Naira (approximately)
    // setNairaEquivalent(total * 365); // Assuming 1 MYR = 365 NGN
  }, [selectedIds, selectedBuy4MeIds, shipmentsData, buy4meData]);

  // Convert currency whenever total amount changes
  useEffect(() => {
    const performCurrencyConversion = async () => {
      if (totalAmount > 0) {
        try {
          setConvertingCurrency(true);
          const nairaAmount = await convertCurrency(totalAmount, "MYR", "NGN");
          setConvertedAmount(nairaAmount);
        } catch (error) {
          console.error("Error converting currency:", error);
          setConvertedAmount(0);
        } finally {
          setConvertingCurrency(false);
        }
      } else {
        setConvertedAmount(0);
      }
    };

    performCurrencyConversion();
  }, [totalAmount]);

  // Handle BizaPay payment
  const handleProcessPayment = async () => {
    if (selectedIds.length === 0 && selectedBuy4MeIds.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      setIsLoading(true);

      const result = await bulkPaymentMutation.mutateAsync({
        payment_for: activeTab === "shipments" ? "SHIPMENT" : "BUY4ME",
        request_ids:
          activeTab === "shipments" ? selectedIds : selectedBuy4MeIds,
      });

      setPaymentResult(result);
      setShowResultDialog(true);
      if (activeTab === "shipments") {
        setSelectedIds([]);
      } else {
        setSelectedBuy4MeIds([]);
      }

      toast.success(
        `Successfully processed ${result.payments_created} payments`
      );
    } catch (error) {
      toast.error("Failed to process payment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PayStack payment
  const handlePayStackPayment = () => {
    if (selectedIds.length === 0 && selectedBuy4MeIds.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    if (convertedAmount <= 0) {
      toast.error("Error converting currency. Please try again.");
      return;
    }

    // Store metadata in localStorage for access on success page
    const metadata = {
      requestType: "driver",
      payment_for: activeTab === "shipments" ? "SHIPMENT" : "BUY4ME",
      request_ids: activeTab === "shipments" ? selectedIds : selectedBuy4MeIds,
      total: totalAmount,
      // Include better description for the PayStack modal
      description: `Payment for ${
        activeTab === "shipments"
          ? `${selectedIds.length} shipment${selectedIds.length > 1 ? "s" : ""}`
          : `${selectedBuy4MeIds.length} Buy4Me order${
              selectedBuy4MeIds.length > 1 ? "s" : ""
            }`
      }`,
      driver_id: "current", // Will be replaced with actual driver ID on the backend
      returnUrl: "/driver/payment/success",
    };

    localStorage.setItem("paymentData", JSON.stringify(metadata));
    setShowPaymentModal(true);
  };

  // Handle viewing item details
  const handleViewDetails = (item: ShipmentProps | string) => {
    if (typeof item === "string") {
      // This is a Buy4Me order ID
      setSelectedItemDetails(item);
      setSelectedShipment(null);
    } else {
      // This is a Shipment object
      setSelectedShipment(item);
      setSelectedItemDetails(null);
    }
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment Processing
          </h1>
          <p className="text-muted-foreground">
            Collect payments for shipments and Buy4Me orders
          </p>
        </div>
      </div>

      {/* Add an info alert at the top of the page */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-medium text-blue-800">Bulk Payment Processing</h3>
          <p className="text-blue-700 mt-1">
            Use the checkboxes to select multiple shipments or Buy4Me orders,
            then process payments for all selected items at once. You can choose
            to process as COD or use PayStack for payment.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="shipments" className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4" />
            <span>Shipments</span>
            {shipmentsData?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {shipmentsData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="buy4me" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Buy4Me Orders</span>
            {buy4meData?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {buy4meData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments">
          {shipmentsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : shipmentsData.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <PackageCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No pending shipments with COD payment
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shipments with COD Payment</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-shipments"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === shipmentsData.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all-shipments">Select All</Label>
                  </div>
                </div>
                <CardDescription>
                  Select shipments to process Cash on Delivery payments
                  {selectedIds.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {selectedIds.length} selected
                    </span>
                  )}
                </CardDescription>
                {selectedIds.length === 0 && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Click the checkboxes to select multiple shipments for
                    processing
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentsData.map((shipment: ShipmentProps) => (
                    <div
                      key={shipment.id}
                      className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id={`shipment-${shipment.id}`}
                          checked={selectedIds.includes(shipment.id)}
                          onCheckedChange={() => handleSelectItem(shipment.id)}
                          className="h-5 w-5 border-2 border-primary"
                        />
                        <div>
                          <h4 className="font-medium text-base">
                            {shipment.tracking_number}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(shipment.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          {formatCurrency(
                            parseFloat(
                              (shipment as any).total_cost ||
                                shipment.total_cost ||
                                "0"
                            )
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(shipment)}
                          className="font-medium px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="buy4me">
          {buy4meLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : buy4meData.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No pending Buy4Me orders with COD payment
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Buy4Me Orders with COD Payment</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-buy4me"
                      checked={
                        selectedBuy4MeIds.length > 0 &&
                        selectedBuy4MeIds.length === buy4meData.length
                      }
                      onCheckedChange={handleSelectAllBuy4Me}
                    />
                    <Label htmlFor="select-all-buy4me">Select All</Label>
                  </div>
                </div>
                <CardDescription>
                  Select Buy4Me orders to process Cash on Delivery payments
                  {selectedBuy4MeIds.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {selectedBuy4MeIds.length} selected
                    </span>
                  )}
                </CardDescription>
                {selectedBuy4MeIds.length === 0 && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Click the checkboxes to select multiple Buy4Me orders for
                    processing
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buy4meData.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id={`order-${order.id}`}
                          checked={selectedBuy4MeIds.includes(order.id)}
                          onCheckedChange={() =>
                            toggleBuy4MeSelection(order.id)
                          }
                          className="h-5 w-5 border-2 border-primary"
                        />
                        <div>
                          <h4 className="font-medium text-base">
                            Order #{order.id.substring(0, 8)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          {formatCurrency(
                            parseFloat(order.total_cost || order.amount || "0")
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order.id)}
                          className="font-medium px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Common Footer with Totals and Actions */}
      <Card className="w-full mt-4">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="bg-gray-50 p-4 rounded-md w-full sm:w-auto">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">Total Amount:</p>
                  <p className="text-lg font-semibold">
                    {totalAmount.toFixed(2)} MYR
                  </p>
                </div>
                {/* <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Naira Equivalent:
                  </p>
                  <p className="text-base font-medium">
                    ₦{nairaEquivalent.toLocaleString()}
                  </p>
                </div> */}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Amount in NGN:
                  </p>
                  <p className="text-base font-medium">
                    ₦{convertedAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <Button
                disabled={
                  isLoading ||
                  (activeTab === "shipments"
                    ? selectedIds.length === 0
                    : selectedBuy4MeIds.length === 0)
                }
                onClick={() => setIsPaymentOpen(true)}
                className="flex-1 sm:flex-none text-base h-12"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay with Bizapay"
                )}
              </Button>

              <Button
                disabled={
                  isLoading ||
                  convertingCurrency ||
                  (activeTab === "shipments"
                    ? selectedIds.length === 0
                    : selectedBuy4MeIds.length === 0)
                }
                onClick={handlePayStackPayment}
                className="flex-1 sm:flex-none text-base h-12"
                variant="outline"
                size="lg"
              >
                {convertingCurrency ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "PayStack"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PayStack Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        price={convertedAmount || 0}
        metadata={{
          requestType: "driver",
          payment_for: activeTab === "shipments" ? "SHIPMENT" : "BUY4ME",
          request_ids:
            activeTab === "shipments" ? selectedIds : selectedBuy4MeIds,
          total: totalAmount,
          description: `Payment for ${
            activeTab === "shipments"
              ? `${selectedIds.length} shipment${
                  selectedIds.length > 1 ? "s" : ""
                }`
              : `${selectedBuy4MeIds.length} Buy4Me order${
                  selectedBuy4MeIds.length > 1 ? "s" : ""
                }`
          }`,
          driver_id: "current", // Will be replaced with actual driver ID on the backend
          returnUrl: "/driver/payment/success",
        }}
      />

      <BizapayPaymentForm
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={totalAmount.toString()}
        paymentType="driver"
        metadata={{
          requestType: "driver",
          payment_for: activeTab === "shipments" ? "SHIPMENT" : "BUY4ME",
          request_ids:
            activeTab === "shipments" ? selectedIds : selectedBuy4MeIds,
          total: totalAmount,
          description: `Payment for ${
            activeTab === "shipments"
              ? `${selectedIds.length} shipment${
                  selectedIds.length > 1 ? "s" : ""
                }`
              : `${selectedBuy4MeIds.length} Buy4Me order${
                  selectedBuy4MeIds.length > 1 ? "s" : ""
                }`
          }`,
          driver_id: "current", // Will be replaced with actual driver ID on the backend
          returnUrl: "/driver/payment/success",
        }}
      />

      {/* Payment Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Payment Processed
            </DialogTitle>
            <DialogDescription>
              Your payment has been processed successfully
            </DialogDescription>
          </DialogHeader>

          {paymentResult && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Payments Created:</span>
                <span>{paymentResult.payments_created}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Total Amount:</span>
                <span>{formatCurrency(paymentResult.total_amount)}</span>
              </div>

              {paymentResult.failed_requests.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Failed Requests:</h4>
                  <div className="bg-red-50 rounded p-3 text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                      {paymentResult.failed_requests.map((failed: any) => (
                        <li key={failed.id}>
                          {failed.id} - {failed.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {showDetailsDialog &&
        (activeTab === "shipments" ? (
          <ShipmentDetailsDialog
            viewDialogOpen={showDetailsDialog}
            setViewDialogOpen={setShowDetailsDialog}
            selectedShipment={selectedShipment}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <Buy4meDetailsDialog
            orderId={selectedItemDetails || ""}
            open={showDetailsDialog}
            onClose={() => {
              setShowDetailsDialog(false);
              setSelectedItemDetails(null);
            }}
          />
        ))}
    </div>
  );
}

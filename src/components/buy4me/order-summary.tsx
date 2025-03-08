"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useToast } from "@/hooks/use-toast";
import { Buy4MeRequest } from "@/lib/types/index";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import PaymentForm from "../payment/payment-gateway";
import { OrderTracking } from "./order-tracking";

export function OrderSummary() {
  const {
    activeRequest,
    calculateTotals,
    submitRequest,
    loading: requestLoading,
  } = useBuy4Me();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<Buy4MeRequest | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");

  const totals = calculateTotals();

  const handleProceedToPayment = () => {
    if (!activeRequest || activeRequest.items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to your request list before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please provide a shipping address.",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      setLoading(true);
      const submitted = await submitRequest(shippingAddress);
      setSubmittedRequest(submitted);
      setShowPayment(false);

      toast({
        title: "Request Submitted",
        description: "Your request has been submitted successfully.",
      });

      // Reset form
      setShippingAddress("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (submittedRequest) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Submitted</CardTitle>
            <CardDescription>
              Thank you for your request. You can track its status below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTracking order={submittedRequest} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment) {
    return (
      <PaymentForm
        amount={totals.total.toString()}
        shippingAddress={shippingAddress}
        paymentType="buy4me"
        metadata={{
          requestType: "buy4me",
          items: activeRequest?.items,
        }}
      />
    );
  }

  if (requestLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activeRequest || activeRequest.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">
          Add items to your request list to proceed
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Review your request details before submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeRequest.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
                {(item.color || item.size) && (
                  <p className="text-sm text-muted-foreground">
                    Specs: {[item.color, item.size].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <p className="font-medium">
                {formatCurrency(parseFloat(item.unit_price) * item.quantity)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Estimated costs including all fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Products Total</span>
            <span>{formatCurrency(totals.productsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee (10%)</span>
            <span>{formatCurrency(totals.serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Shipping</span>
            <span>{formatCurrency(totals.shipping)}</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
          <div className="space-y-2 pt-4">
            <label htmlFor="shipping-address" className="text-sm font-medium">
              Shipping Address
            </label>
            <Textarea
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your complete shipping address"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleProceedToPayment}
            disabled={
              loading || !activeRequest.items.length || !shippingAddress.trim()
            }
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </CardFooter>
      </Card>

      {/* <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Request Processing Timeline</CardTitle>
          <CardDescription>Estimated processing and delivery schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Purchase Processing</span>
              <span>2-3 business days</span>
            </div>
            <Progress value={33} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>International Shipping</span>
              <span>7-10 business days</span>
            </div>
            <Progress value={0} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Local Delivery</span>
              <span>1-2 business days</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

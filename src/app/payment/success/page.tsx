"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { useBulkPayment } from "@/hooks/use-driver";
import { toast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { submitRequest: submitBuy4MeRequest } = useBuy4Me();
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const bulkPaymentMutation = useBulkPayment();

  const handlePaymentSuccess = async () => {
    const paymentData = JSON.parse(localStorage.getItem("paymentData") || "{}");
    console.log("paymentData: ", paymentData);
    if (!paymentData) {
      toast({
        title: "Error",
        description: "Payment data not found",
        variant: "destructive",
      });
      return;
    }

    try {
      if (paymentData.requestType === "driver") {
        if (
          !paymentData.payment_for ||
          !paymentData.request_ids ||
          !paymentData.request_ids.length
        ) {
          toast({
            title: "Error",
            description: "Invalid payment data. Missing required information.",
            variant: "destructive",
          });
          return;
        }

        setReturnPath("/driver");
        console.log("in the driver payment");
        // Use the bulk payment API to process the payment
        await bulkPaymentMutation.mutateAsync({
          payment_for: paymentData.payment_for,
          request_ids: paymentData.request_ids,
        });

        toast({
          title: "Success",
          description: "Driver payment recorded successfully",
        });

        toast({
          title: "Success",
          description: "Driver payment recorded successfully",
        });
      } else if (paymentData.requestType === "buy4me") {
        setReturnPath("/buy4me");

        // Check if there's an active request set in localStorage
        let activeRequestData = localStorage.getItem("activeRequest");

        // If the activeRequest isn't in localStorage but it's in the PayStack metadata, use that
        if (
          (!activeRequestData || activeRequestData === "{}") &&
          paymentData.activeRequest
        ) {
          try {
            // Store the active request from PayStack metadata back into localStorage
            localStorage.setItem("activeRequest", paymentData.activeRequest);
            activeRequestData = paymentData.activeRequest;
            console.log(
              "Restored activeRequest from PayStack metadata:",
              paymentData.activeRequest
            );
          } catch (error) {
            console.error("Error parsing activeRequest from metadata:", error);
          }
        }

        if (!activeRequestData || activeRequestData === "{}") {
          toast({
            title: "Error",
            description: "Request data not found. Please try again.",
            variant: "destructive",
          });
          return;
        }

        try {
          // Use the stored request ID if available
          if (paymentData.requestId) {
            console.log(
              "Using requestId from PayStack metadata:",
              paymentData.requestId
            );
          }

          await submitBuy4MeRequest(
            paymentData.shipping_address,
            paymentData.notes
          );

          toast({
            title: "Request Submitted",
            description: "Your buy4me request has been submitted successfully.",
          });
        } catch (error) {
          console.error("Error submitting request:", error);
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to submit request",
            variant: "destructive",
          });
        }
      } else if (paymentData.requestType === "shipping") {
        setReturnPath("/shipping");
        await ShippingAPI.updateShipment(paymentData.shipmentId!, {
          payment_status: "PAID",
        });

        toast({
          title: "Shipment Updated",
          description: "Your shipping request payment has been updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process request.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (reference) {
      fetch(`/api/paystack/verify-payment?reference=${reference}`)
        .then((res) => res.json())
        .then(async (data) => {
          setVerification(data);
          if (data?.status && data?.data?.status === "success") {
            await handlePaymentSuccess();
          } else {
            toast({
              title: "Error",
              description: "Payment verification failed",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error(error);
          toast({
            title: "Error",
            description: "Failed to verify payment",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [reference]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <CardTitle className="text-2xl font-bold">
              Verifying Payment...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!reference) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-600">
              Invalid Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">
                No payment reference was provided.
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Link href={returnPath || "/"}>
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess =
    verification?.status && verification?.data?.status === "success";
  const amount = verification?.data?.amount
    ? (parseInt(verification.data.amount) / 100).toFixed(2)
    : "0.00";

  // Get payment data to determine return path
  const paymentData = JSON.parse(localStorage.getItem("paymentData") || "{}");
  //   const returnPath =
  //     paymentData.requestType === "driver" ? "/driver" : "/buy4me";

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isSuccess ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <CardTitle
            className={`text-2xl font-bold ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {isSuccess ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              {isSuccess ? (
                <>
                  Your payment of{" "}
                  <span className="font-semibold">₦{amount}</span> has been
                  processed successfully.
                </>
              ) : (
                "There was an issue processing your payment."
              )}
            </p>
            <p className="text-sm text-gray-500">
              Transaction Reference: {reference}
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <Link href={returnPath || "/"}>
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

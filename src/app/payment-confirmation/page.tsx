// app/payment-confirmation/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBuy4Me } from "@/hooks/use-buy4me";
import { toast } from "@/hooks/use-toast";
import { ShippingAPI } from "@/lib/api/shipping";

import { useBulkPayment } from "@/hooks/use-driver";
import { CheckCircle, Clock, HomeIcon, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface PaymentStatus {
  status: "success" | "pending" | "failed" | "unpaid";
  title: string;
  message: string;
  icon: JSX.Element;
  color: string;
}

const STATUS_MAP: Record<string, PaymentStatus> = {
  "1": {
    status: "success",
    title: "Payment Successful!",
    message:
      "Your payment has been confirmed and your request is being processed.",
    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
    color: "text-green-600",
  },
  "2": {
    status: "pending",
    title: "Payment Pending",
    message: "Your payment is being processed. Please wait a moment.",
    icon: <Clock className="w-12 h-12 text-orange-500 animate-pulse" />,
    color: "text-orange-600",
  },
  "3": {
    status: "failed",
    title: "Payment Failed",
    message:
      "Unfortunately, your payment was not successful. Please try again.",
    icon: <XCircle className="w-12 h-12 text-red-500" />,
    color: "text-red-600",
  },
  "4": {
    status: "unpaid",
    title: "Payment Not Made",
    message: "No payment has been recorded for this transaction.",
    icon: <XCircle className="w-12 h-12 text-gray-500" />,
    color: "text-gray-600",
  },
};

function PaymentConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billStatus = searchParams.get("billstatus");
  const billCode = searchParams.get("billcode");
  const isProcessingRef = useRef(false);
  const bulkPaymentMutation = useBulkPayment();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { submitRequest: submitBuy4MeRequest, loading: buy4meLoading } =
    useBuy4Me();

  const handlePaymentSuccess = async () => {
    const paymentData = JSON.parse(localStorage.getItem("paymentData") || "{}");
    if (!paymentData) {
      setError("Payment data not found");
      return;
    }

    try {
      setLoading(true);

      if (paymentData.requestType === "driver") {
        // Handle driver payment
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
        await bulkPaymentMutation.mutateAsync({
          payment_for: paymentData.payment_for,
          request_ids: paymentData.request_ids,
        });

        toast({
          title: "Success",
          description: "Driver payment recorded successfully",
        });
      } else if (paymentData.paymentType === "buy4me") {
        await submitBuy4MeRequest(
          paymentData.shippingAddress!,
          paymentData.cityId!
        );
        toast({
          title: "Request Submitted",
          description: "Your buy4me request has been submitted successfully.",
        });
      } else if (paymentData.paymentType === "shipping") {
        await ShippingAPI.updateShipment(paymentData.metadata?.shipmentId!, {
          payment_status: "PAID",
        });

        toast({
          title: "Shipment Created",
          description: "Your shipping request has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process request.",
        variant: "destructive",
      });
      setError(
        error instanceof Error ? error.message : "Failed to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      if (!billStatus || !billCode) {
        setError("Invalid payment information");
        setLoading(false);
        return;
      }

      try {
        switch (billStatus) {
          case "1":
            // Check if already processing to prevent duplicates
            if (!isProcessingRef.current) {
              isProcessingRef.current = true;
              try {
                await handlePaymentSuccess();
              } finally {
                isProcessingRef.current = false;
              }
            }
            break;

          case "2":
            // Start polling for status updates
            const pollInterval = setInterval(async () => {
              const status = await checkPaymentStatus(billCode);
              if (status === "1" && !isProcessingRef.current) {
                isProcessingRef.current = true;
                clearInterval(pollInterval);
                try {
                  await handlePaymentSuccess();
                } finally {
                  isProcessingRef.current = false;
                }
              } else if (status === "3") {
                clearInterval(pollInterval);
                setError("Payment verification failed");
              }
            }, 5000);

            // Clear interval after 2 minutes (timeout)
            setTimeout(() => {
              clearInterval(pollInterval);
              // Only set error if processing hasn't started
              if (!isProcessingRef.current) {
                setError("Payment verification timeout");
              }
            }, 120000);
            break;

          case "3":
            handlePaymentSuccess();
            setError("Payment failed");
            break;

          case "4":
            // No action needed for unpaid status
            break;

          default:
            setError("Unknown payment status");
        }
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("Failed to process payment");
      } finally {
        // Only set loading to false if not in polling state
        if (billStatus !== "2") {
          setLoading(false);
        }
      }
    };

    processPayment();
  }, [billStatus, billCode]);

  if (loading || buy4meLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-600">
          Processing your payment...
        </p>
      </div>
    );
  }

  const status = billStatus
    ? STATUS_MAP[billStatus]
    : {
        status: "failed",
        title: "Error",
        message: error || "Invalid payment information",
        icon: <XCircle className="w-12 h-12 text-red-500" />,
        color: "text-red-600",
      };

  // Get payment data to determine return path
  const paymentData = JSON.parse(localStorage.getItem("paymentData") || "{}");
  const returnPath = paymentData.requestType === "driver" ? "/driver" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{status.icon}</div>
          <CardTitle className={`text-2xl font-bold ${status.color}`}>
            {status.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">{status.message}</p>

          {billCode && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Transaction Reference</p>
              <p className="font-mono text-gray-700">{billCode}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(returnPath)}
            className="flex items-center"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>

          {status.status === "failed" && (
            <Button variant="default" onClick={() => router.push(returnPath)}>
              Try Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper function to check payment status
async function checkPaymentStatus(
  billCode: string
): Promise<"1" | "2" | "3" | "4"> {
  try {
    const response = await fetch(`/api/bizapay/confirm?bill_code=${billCode}`);
    const data = await response.json();
    return data.bill.payments.status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return "3";
  }
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-600">
            Loading payment status...
          </p>
        </div>
      }
    >
      <PaymentConfirmationContent />
    </Suspense>
  );
}

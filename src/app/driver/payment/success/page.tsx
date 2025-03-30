"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkPayment } from "@/hooks/use-driver";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bulkPaymentMutation = useBulkPayment();

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setError("No payment reference provided");
        setLoading(false);
        return;
      }

      try {
        // Verify PayStack payment
        const res = await fetch(
          `/api/paystack/verify-payment?reference=${reference}`
        );
        const data = await res.json();
        setVerification(data);

        if (data.status && data.data.status === "success") {
          // Process the payment using stored metadata
          const paymentData =
            data.data.metadata ||
            JSON.parse(localStorage.getItem("paymentData") || "{}");

          if (
            !paymentData.payment_for ||
            !paymentData.request_ids ||
            !paymentData.request_ids.length
          ) {
            setError("Invalid payment data. Missing required information.");
            setLoading(false);
            return;
          }

          // Use the bulk payment API to process the payment
          await bulkPaymentMutation.mutateAsync({
            payment_for: paymentData.payment_for,
            request_ids: paymentData.request_ids,
          });

          toast.success("Payment processed successfully");
        } else {
          setError("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment processing error:", error);
        setError(
          "An error occurred while processing your payment. Please contact support."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference, bulkPaymentMutation]);

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

  if (!reference || error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-600">
              {!reference ? "Invalid Request" : "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">
                {!reference
                  ? "No payment reference was provided."
                  : error || "There was an issue with your payment."}
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Link href="/driver/payment">
                <Button>Return to Payment Page</Button>
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
            <Link href="/driver/payment">
              <Button>Return to Payment Page</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <CardTitle className="text-2xl font-bold">
                Loading payment details...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

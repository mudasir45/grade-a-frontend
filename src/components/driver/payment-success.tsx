import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PaymentSuccessProps {
  paymentMethod: "paystack" | "bizapay";
}

export function PaymentSuccess({ paymentMethod }: PaymentSuccessProps) {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference"); // Paystack reference
  const billCode = searchParams.get("bill_code"); // BizaPay bill code

  const handlePaymentSuccess = async (
    paymentId: string,
    amount: string,
    metadata: any
  ) => {
    try {
      // Parse metadata if it's a string
      const parsedMetadata =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      console.log("parsedMetadata: ", parsedMetadata);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/driver/payments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            payment_id: paymentId,
            amount: amount,
            driver: parsedMetadata.driver_id,
            payment_for: parsedMetadata.payment_for,
            [parsedMetadata.payment_for.toLowerCase()]: parsedMetadata.item_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record payment");
      }

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment in the system",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in the calling function
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (paymentMethod === "paystack" && reference) {
          const res = await fetch(
            `/api/paystack/verify-payment?reference=${reference}`
          );
          const data = await res.json();
          setVerification(data);

          if (data.status && data.data.status === "success") {
            await handlePaymentSuccess(
              data.data.reference,
              (data.data.amount / 100).toString(),
              data.data.metadata
            );
          }
        } else if (paymentMethod === "bizapay" && billCode) {
          const res = await fetch(`/api/bizapay/confirm?bill_code=${billCode}`);
          const data = await res.json();
          setVerification(data);

          if (data.bill?.payments?.status === "1") {
            // For BizaPay, metadata is stored as a string in the bill object
            const metadata = data.bill.metadata || "{}";
            await handlePaymentSuccess(
              billCode,
              data.bill.amount.toString(),
              metadata
            );
          }
        } else {
          throw new Error("Invalid payment verification parameters");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast({
          title: "Error",
          description:
            "Failed to verify payment. Please contact support if payment was deducted.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference, billCode, paymentMethod]);

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

  const isSuccess =
    (paymentMethod === "paystack" &&
      verification?.status &&
      verification.data?.status === "success") ||
    (paymentMethod === "bizapay" &&
      verification?.bill?.payments?.status === "1");

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isSuccess ? (
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <div className="w-16 h-16 text-red-500 mx-auto mb-4">❌</div>
          )}
          <CardTitle className="text-2xl font-bold">
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            {isSuccess
              ? "Your payment has been processed and recorded successfully."
              : "There was an error processing your payment. Please try again or contact support."}
          </p>
          <Button onClick={() => router.push("/driver")}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

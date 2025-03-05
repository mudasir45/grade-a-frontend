// app/components/PaymentForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/contexts/payment-context";
import { FormEvent, useEffect, useState } from "react";

interface PaymentFormProps {
  amount: string;
  orderId?: string;
  shippingAddress?: string;
  paymentType: "buy4me" | "shipping";
  metadata?: Record<string, any>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  orderId,
  shippingAddress,
  paymentType,
  metadata,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { setPaymentData } = usePayment();

  useEffect(() => {
    console.log(metadata);
  }, [metadata]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const finalOrderId = orderId || crypto.randomUUID();

      // Store payment data in context for confirmation page
      setPaymentData({
        amount,
        orderId: finalOrderId,
        shippingAddress,
        paymentType,
        metadata,
      });
      const paymentData = {
        amount,
        orderId: finalOrderId,
        shippingAddress,
        paymentType,
        metadata,
      };
      localStorage.setItem("paymentData", JSON.stringify(paymentData));

      const res = await fetch("/api/bizapay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName: name,
          payerEmail: email,
          payerPhone: phone,
          webReturnUrl: `${window.location.origin}/payment-confirmation`,
          callbackUrl: `${window.location.origin}/api/bizapay/webhook`,
          orderId: finalOrderId,
          amount,
          paymentType,
          metadata,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(
          data.msg || "Payment initiation failed: No redirect URL provided."
        );
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError("Payment error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enter Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : `Pay ${amount} MYR`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;

"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/contexts/payment-context";
import { FormEvent, useEffect, useState } from "react";

interface PaymentFormProps {
  amount: string;
  orderId?: string;
  shippingAddress?: string;
  paymentType: "buy4me" | "shipping" | "driver";
  metadata?: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
}

const BizapayPaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  orderId,
  shippingAddress,
  paymentType,
  metadata,
  isOpen,
  onClose,
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

      setPaymentData({
        amount,
        orderId: finalOrderId,
        shippingAddress,
        paymentType,
        metadata,
      });

      localStorage.setItem("paymentData", JSON.stringify(metadata));

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Enter Payment Details</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default BizapayPaymentForm;

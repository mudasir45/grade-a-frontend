"use client";

import { PaymentSuccess } from "@/components/driver/payment-success";
import { useSearchParams } from "next/navigation";

export default function DriverPaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get("method") as "paystack" | "bizapay";

  return <PaymentSuccess paymentMethod={paymentMethod || "paystack"} />;
}

"use client";
import { createContext, useContext, useState } from "react";

interface PaymentData {
  amount: string;
  orderId?: string;
  shippingAddress?: string;
  paymentType: "buy4me" | "shipping" | "driver";
  metadata?: Record<string, any>;
}

interface PaymentContextType {
  paymentData: PaymentData | null;
  setPaymentData: (data: PaymentData | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  return (
    <PaymentContext.Provider value={{ paymentData, setPaymentData }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}

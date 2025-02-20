// app/checkout/page.tsx
"use client"
import PaymentForm from "@/components/payment/payment-gateway";


export default function CheckoutPage() {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <PaymentForm
        amount="35.00"
        onSuccess={(data) => console.log('Payment initiated:', data)}
        onFailure={(error) => console.error('Payment error:', error)}
      />
    </div>
  );
}

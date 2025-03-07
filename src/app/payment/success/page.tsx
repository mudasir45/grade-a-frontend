"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reference) {
      fetch(`/api/paystack/verify-payment?reference=${reference}`)
        .then((res) => res.json())
        .then((data) => {
          setVerification(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [reference]);

  if (loading) return <p>Verifying payment...</p>;
  if (!reference) return <p>No reference provided.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4">
      <h2 className="text-2xl mb-4">Payment Verification</h2>
      {verification &&
      verification.status &&
      verification.data.status === "success" ? (
        <div className="text-center">
          <p className="text-xl font-semibold text-green-800">
            Payment Successful!
          </p>
          <p>Reference: {verification.data.reference}</p>
          <p>Amount: {parseInt(verification.data.amount) / 100} NGN</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl font-semibold text-red-800">
            Payment Verification Failed or Pending.
          </p>
          <pre className="mt-4 text-xs p-2 bg-white rounded">
            {JSON.stringify(verification, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

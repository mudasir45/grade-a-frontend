"use client";

import { useState } from "react";

interface PaymentModalProps {
  price: number; // Price in NGN
  isOpen: boolean;
  onClose: () => void;
  metadata: Record<string, any>;
}

export default function PaymentModal({
  price,
  isOpen,
  onClose,
  metadata,
}: PaymentModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store the metadata for use in success page
      localStorage.setItem("paymentData", JSON.stringify(metadata));

      // Call our API route to initialize payment, using the passed price
      const res = await fetch("/api/paystack/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: price,
        }),
      });

      const data = await res.json();
      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.message || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert(
        error instanceof Error ? error.message : "Payment initialization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        <p className="mb-4 text-lg">
          Price: <span className="font-bold">{price} NGN</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

// app/components/PaymentForm.tsx
'use client';

import { FormEvent, useState } from 'react';

interface PaymentFormProps {
  amount: string;
  orderId?: string;
  shippingAddress?: string;
//   onSuccess?: (response: any) => void;
//   onFailure?: (error: any) => void;
}


const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  orderId,
  shippingAddress,
//   onSuccess,
//   onFailure,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalOrderId = orderId || crypto.randomUUID();
      const res = await fetch('/api/bizapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerName: name,
          payerEmail: email,
          payerPhone: phone,
          webReturnUrl: 'http://localhost:3000/payment-confirmation?shipping_address=' + shippingAddress,
          callbackUrl: 'http://localhost:3000/payment-confirmation?shipping_address=' + shippingAddress,
          orderId: finalOrderId,
          amount,
        }),
      });
      const data = await res.json();
      if (data.url) {
        console.log("data: ", data)
        window.location.href = data.url;
        //   onSuccess && onSuccess(data);
      } else {
        setError('Payment initiation failed: No redirect URL provided.');
        //   onFailure && onFailure(data);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError('Payment error occurred.');
      //   onFailure && onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto  p-6 rounded shadow ">
      <h2 className="text-2xl font-semibold mb-4">Enter Your Details</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block font-semibold text-gray-700 mb-1">Name</label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="phone" className="block font-semibold text-gray-700 mb-1">Phone</label>
        <input
          type="text"
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        {loading ? 'Processing...' : `Pay Now (${amount} $)`}
      </button>
    </form>
  );
};

export default PaymentForm;

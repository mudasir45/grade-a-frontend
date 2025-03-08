import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.text();
  const event = JSON.parse(payload);

  // Optionally verify the event signature using the 'x-paystack-signature' header

  if (event.event === "charge.success") {
    // Verify transaction details if necessary
    // Update your database, send email, etc.
    console.log("Payment successful:", event.data);
  }

  // Always return a 200 OK response
  return NextResponse.json({ received: true });
}

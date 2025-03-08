import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, amount } = await request.json();

  if (!email || !amount) {
    return NextResponse.json(
      { status: false, message: "Email and amount are required" },
      { status: 400 }
    );
  }

  // Convert the amount (in NGN) to its subunit (kobo)
  const amountInKobo = parseInt(amount) * 100;

  const payload = {
    email,
    amount: amountInKobo.toString(),
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  };

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { status: false, message: "Paystack secret key is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: "Error initializing payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

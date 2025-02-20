// app/api/confirm/route.ts
import axios from 'axios';
import FormData from 'form-data';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic' // Mark this route as dynamic

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bill_code = searchParams.get('bill_code');
    if (!bill_code) {
      return NextResponse.json({ error: 'Missing payment_id parameter' }, { status: 400 });
    }

    // Load credentials from environment variables
    const bizapayApiKey = process.env.BIZAPAY_API_KEY;
    const bizapayAuth = process.env.BIZAPAY_AUTH;
    if (!bizapayApiKey || !bizapayAuth) {
      return NextResponse.json({ error: 'Missing gateway credentials' }, { status: 500 });
    }

    // Call the payment gateway confirmation endpoint.
    // (Replace with the actual confirmation endpoint per your gateway's docs)

    const formData = new FormData();
    formData.append('apiKey', bizapayApiKey);
    formData.append('search_str', bill_code);
    formData.append('payment_status', '1');
    formData.append('latest', "true");


    const confirmEndpoint = "https://www.bizappay.my/api/v3/bill/info";
    const response = await axios.post(confirmEndpoint, formData, {
      headers: { 'Authentication': bizapayAuth },
      ...(typeof formData.getHeaders === 'function' ? formData.getHeaders() : {}),

    });

   
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Payment confirmation error', details: error.message },
      { status: 500 }
    );
  }
}

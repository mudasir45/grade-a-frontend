// app/api/bizapay/route.ts
import axios from 'axios';
import FormData from 'form-data';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      payerName,
      payerEmail,
      payerPhone,
      webReturnUrl,
      callbackUrl,
      orderId,
      amount,
    } = body;

    // validate the amount and fix it to 2 decimal places
    const fixedAmount = parseFloat(amount).toFixed(2);
    // Load Bizapay credentials from environment variables
    const bizapayAuth = process.env.BIZAPAY_AUTH;
    const bizapayApiKey = process.env.BIZAPAY_API_KEY;
    const bizapayCategory = process.env.BIZAPAY_CATEGORY;
    if (!bizapayAuth || !bizapayApiKey || !bizapayCategory) {
      return NextResponse.json({ error: 'Missing Bizapay environment variables.' }, { status: 500 });
    }

    // Build the FormData payload
    const formData = new FormData();
    formData.append('apiKey', bizapayApiKey);
    formData.append('category', bizapayCategory);
    formData.append('name', 'Order Payment');
    formData.append('amount', fixedAmount); // e.g. "35.00"
    formData.append('payer_name', payerName);
    formData.append('payer_email', payerEmail);
    formData.append('payer_phone', payerPhone);
    formData.append('webreturn_url', webReturnUrl || '');
    formData.append('callback_url', callbackUrl || '');
    // Use the orderId as an external reference
    formData.append('ext_reference', orderId);

    // Bizapay API endpoint (adjust for sandbox/production)
    const bizapayEndpoint = 'https://bizappay.my/api/v3/bill/create';
    const response = await axios.post(bizapayEndpoint, formData, {
      headers: {
        'Authentication': bizapayAuth,
        ...(typeof formData.getHeaders === 'function' ? formData.getHeaders() : {}),
      },
    });
    // Expect the response to include a 'redirect_url'
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Bizapay API error:', error);
    return NextResponse.json({ error: 'Bizapay integration error', details: error.message }, { status: 500 });
  }
}

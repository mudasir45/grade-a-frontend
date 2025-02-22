// app/api/bizapay/route.ts
import { bizapayService } from '@/lib/api/bizapay';
import axios from 'axios';
import FormData from 'form-data';
import { NextResponse } from 'next/server';

interface BizapayRequestData {
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  webReturnUrl?: string;
  callbackUrl?: string;
  orderId: string;
  amount: string;
}

const BIZAPAY_ENDPOINT = 'https://bizappay.my/api/v3/bill/create';

async function createBizapayBill(data: BizapayRequestData, authToken: string) {
  const bizapayApiKey = process.env.BIZAPAY_API_KEY;
  const bizapayCategory = process.env.BIZAPAY_CATEGORY;
  
  if (!bizapayApiKey || !bizapayCategory) {
    throw new Error('Missing Bizapay environment variables.');
  }

  const formData = new FormData();
  formData.append('apiKey', bizapayApiKey);
  formData.append('category', bizapayCategory);
  formData.append('name', 'Order Payment');
  formData.append('amount', parseFloat(data.amount).toFixed(2));
  formData.append('payer_name', data.payerName);
  formData.append('payer_email', data.payerEmail);
  formData.append('payer_phone', data.payerPhone);
  formData.append('webreturn_url', data.webReturnUrl || '');
  formData.append('callback_url', data.callbackUrl || '');
  formData.append('ext_reference', data.orderId);

  const response = await axios.post(BIZAPAY_ENDPOINT, formData, {
    headers: {
      'Authentication': authToken,
      ...(typeof formData.getHeaders === 'function' ? formData.getHeaders() : {}),
    },
  });

  return response.data;
}

export async function POST(request: Request) {
  try {
    const requestData: BizapayRequestData = await request.json();

    // Get a valid authentication token
    const authToken = await bizapayService.getToken();

    try {
      const result = await createBizapayBill(requestData, authToken);
      return NextResponse.json(result);
    } catch (error: any) {
      // Check if error is due to token expiration
      if (error.response?.status === 401) {
        // Get a fresh token and retry the request once
        const newToken = await bizapayService.getToken();
        const result = await createBizapayBill(requestData, newToken);
        return NextResponse.json(result);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Bizapay API error:', error);
    return NextResponse.json(
      { 
        error: 'Bizapay integration error', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

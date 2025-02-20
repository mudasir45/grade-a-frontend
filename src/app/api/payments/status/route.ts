import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const billCode = searchParams.get('billcode')

  if (!billCode) {
    return NextResponse.json({ error: 'Missing billcode' }, { status: 400 })
  }

  try {
    // Here you would typically check the payment status with your payment provider
    // For now, we'll return a mock response
    return NextResponse.json({
      status: 'completed',
      billCode
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
} 
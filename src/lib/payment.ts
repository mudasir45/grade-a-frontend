// Simulated payment processing
export async function processPayment(amount: number, currency: string): Promise<{
  success: boolean
  transactionId: string
  message: string
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Simulate success rate
  const success = Math.random() > 0.1

  if (success) {
    return {
      success: true,
      transactionId: Math.random().toString(36).substr(2, 9),
      message: 'Payment processed successfully'
    }
  }

  throw new Error('Payment processing failed. Please try again.')
}

export function validatePaymentDetails(details: {
  cardNumber: string
  expiryDate: string
  cvv: string
}): boolean {
  const { cardNumber, expiryDate, cvv } = details

  // Basic validation
  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
    throw new Error('Invalid card number')
  }

  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    throw new Error('Invalid expiry date format (MM/YY)')
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    throw new Error('Invalid CVV')
  }

  return true
}
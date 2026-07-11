import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateOrderParams {
  amount: number // in paise (100 paise = 1 rupee)
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

export interface CreateOrderResult {
  id: string
  entity: string
  amount: number
  currency: string
  receipt: string
  status: string
  notes: Record<string, string>
}

export interface VerifyPaymentParams {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

/**
 * Create a Razorpay order for payment
 */
export const createOrder = async (params: CreateOrderParams): Promise<CreateOrderResult> => {
  try {
    const options = {
      amount: params.amount, // amount in paise
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    }

    const order = await razorpay.orders.create(options)
    return order as CreateOrderResult
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    throw new Error('Failed to create payment order')
  }
}

/**
 * Verify payment signature from Razorpay webhook/callback
 */
export const verifyPaymentSignature = (params: VerifyPaymentParams): boolean => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params

    // Create signature string
    const signatureString = `${razorpayOrderId}|${razorpayPaymentId}`

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(signatureString)
      .digest('hex')

    // Compare signatures
    return expectedSignature === razorpaySignature
  } catch (error) {
    console.error('Payment signature verification failed:', error)
    return false
  }
}

/**
 * Fetch payment details from Razorpay
 */
export const fetchPayment = async (paymentId: string) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    throw new Error('Failed to fetch payment details')
  }
}

/**
 * Initiate refund for a payment
 */
export const initiateRefund = async (paymentId: string, amount?: number) => {
  try {
    const refundData: any = { payment_id: paymentId }
    if (amount) {
      refundData.amount = amount // amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData)
    return refund
  } catch (error) {
    console.error('Failed to initiate refund:', error)
    throw new Error('Failed to initiate refund')
  }
}

/**
 * Create transfer to lender after successful transaction
 */
export const createTransfer = async (
  paymentId: string,
  accountId: string,
  amount: number,
  currency: string = 'INR'
) => {
  try {
    const transfer = await razorpay.payments.transfer(paymentId, {
      transfers: [
        {
          account: accountId,
          amount,
          currency,
          notes: {
            name: 'Lender Payment',
          },
        },
      ],
    })
    return transfer
  } catch (error) {
    console.error('Failed to create transfer:', error)
    throw new Error('Failed to transfer funds to lender')
  }
}

export default {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  initiateRefund,
  createTransfer,
}

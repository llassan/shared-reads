import { apiClient } from './client'

export interface CreateOrderRequest {
  transactionId: string
}

export interface CreateOrderResponse {
  message: string
  order: {
    id: string
    amount: number
    currency: string
  }
  transaction: any
}

export interface VerifyPaymentRequest {
  transactionId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  message: string
  transaction: any
}

export interface InitiateRefundRequest {
  transactionId: string
  reason: string
}

export const paymentsApi = {
  /**
   * Create a payment order for a transaction
   */
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/payments/create-order', data)
    return response.data
  },

  /**
   * Verify payment after successful payment
   */
  verifyPayment: async (data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post('/payments/verify', data)
    return response.data
  },

  /**
   * Get payment details for a transaction
   */
  getTransactionPayment: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/payments/transaction/${transactionId}`)
    return response.data
  },

  /**
   * Initiate refund for a transaction
   */
  initiateRefund: async (data: InitiateRefundRequest): Promise<any> => {
    const response = await apiClient.post('/payments/refund', data)
    return response.data
  },
}

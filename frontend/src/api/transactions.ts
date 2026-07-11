import { apiClient } from './client'

export interface ConfirmHandoverRequest {
  photoBase64: string
}

export interface ConfirmReturnRequest {
  photoBase64: string
}

export const transactionsApi = {
  /**
   * Get transaction by ID
   */
  getTransaction: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data.data.transaction
  },

  /**
   * Get all transactions for current user
   */
  getMyTransactions: async (): Promise<any> => {
    const response = await apiClient.get('/transactions')
    return response.data.data.transactions
  },

  /**
   * Confirm book handover (lender)
   */
  confirmHandover: async (id: string, data: ConfirmHandoverRequest): Promise<any> => {
    const response = await apiClient.post(`/transactions/${id}/handover`, data)
    return response.data
  },

  /**
   * Confirm book return (borrower)
   */
  confirmReturn: async (id: string, data: ConfirmReturnRequest): Promise<any> => {
    const response = await apiClient.post(`/transactions/${id}/return`, data)
    return response.data
  },

  /**
   * Complete transaction (lender)
   */
  completeTransaction: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/transactions/${id}/complete`)
    return response.data
  },
}

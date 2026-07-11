import { apiClient } from './client'

export interface CreateReviewRequest {
  transactionId: string
  rating: number
  comment?: string
}

export const reviewsApi = {
  /**
   * Create a review for a completed transaction
   */
  createReview: async (data: CreateReviewRequest): Promise<any> => {
    const response = await apiClient.post('/reviews', data)
    return response.data
  },

  /**
   * Get reviews for a specific user
   */
  getUserReviews: async (userId: string, page: number = 1, limit: number = 10): Promise<any> => {
    const response = await apiClient.get(`/reviews/user/${userId}`, {
      params: { page, limit },
    })
    return response.data.data
  },

  /**
   * Get reviews for a specific transaction
   */
  getTransactionReviews: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/reviews/transaction/${transactionId}`)
    return response.data.data.reviews
  },

  /**
   * Check if current user can review a transaction
   */
  canReviewTransaction: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/reviews/can-review/${transactionId}`)
    return response.data.data
  },
}

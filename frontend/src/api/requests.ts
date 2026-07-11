import axios from '../lib/axios'

export interface BorrowRequest {
  id: string
  borrowerId: string
  lenderId: string
  bookListingId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  rejectionReason: string | null
  createdAt: string
  approvedAt: string | null
  rejectedAt: string | null
  borrower: {
    id: string
    name: string | null
    email: string
    phone: string
    reputationScore: number
    profilePhoto: string | null
  }
  lender: {
    id: string
    name: string | null
    email: string
    phone: string
    reputationScore: number
  }
  bookListing: {
    id: string
    title: string
    author: string
    images: string[]
    rentalType: 'FREE' | 'PAID'
    rentalPrice: number | null
    depositAmount: number | null
    rentalDuration: number
    condition: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const requestsApi = {
  /**
   * Create a borrow request
   */
  createRequest: async (bookListingId: string): Promise<BorrowRequest> => {
    const response = await axios.post<ApiResponse<{ borrowRequest: BorrowRequest }>>(
      '/requests',
      { bookListingId }
    )
    return response.data.data.borrowRequest
  },

  /**
   * Get my requests (as borrower)
   */
  getMyRequests: async (): Promise<BorrowRequest[]> => {
    const response = await axios.get<ApiResponse<{ requests: BorrowRequest[] }>>(
      '/requests/my-requests'
    )
    return response.data.data.requests
  },

  /**
   * Get incoming requests (as lender)
   */
  getIncomingRequests: async (): Promise<BorrowRequest[]> => {
    const response = await axios.get<ApiResponse<{ requests: BorrowRequest[] }>>(
      '/requests/incoming'
    )
    return response.data.data.requests
  },

  /**
   * Get single request
   */
  getRequest: async (id: string): Promise<BorrowRequest> => {
    const response = await axios.get<ApiResponse<{ borrowRequest: BorrowRequest }>>(
      `/requests/${id}`
    )
    return response.data.data.borrowRequest
  },

  /**
   * Approve request (lender)
   */
  approveRequest: async (id: string): Promise<void> => {
    await axios.post(`/requests/${id}/approve`)
  },

  /**
   * Reject request (lender)
   */
  rejectRequest: async (id: string, rejectionReason: string): Promise<void> => {
    await axios.post(`/requests/${id}/reject`, { rejectionReason })
  },

  /**
   * Cancel request (borrower)
   */
  cancelRequest: async (id: string): Promise<void> => {
    await axios.delete(`/requests/${id}`)
  },
}

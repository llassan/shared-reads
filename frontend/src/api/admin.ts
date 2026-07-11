import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Create separate axios instance for admin API (uses different auth)
const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface ResolveDisputeRequest {
  resolutionOutcome: 'REFUND_TO_BORROWER' | 'KEEP_WITH_LENDER' | 'SPLIT_50_50'
  resolutionNotes?: string
}

export const adminApi = {
  /**
   * Admin login
   */
  login: async (data: AdminLoginRequest): Promise<any> => {
    const response = await adminClient.post('/admin/login', data)
    return response.data
  },

  /**
   * Get platform statistics
   */
  getStats: async (): Promise<any> => {
    const response = await adminClient.get('/admin/stats')
    return response.data.data
  },

  /**
   * Get all pending disputes
   */
  getPendingDisputes: async (): Promise<any> => {
    const response = await adminClient.get('/admin/disputes/pending')
    return response.data.data.disputes
  },

  /**
   * Resolve a dispute
   */
  resolveDispute: async (disputeId: string, data: ResolveDisputeRequest): Promise<any> => {
    const response = await adminClient.post(`/admin/disputes/${disputeId}/resolve`, data)
    return response.data
  },

  /**
   * Get all users
   */
  getAllUsers: async (page: number = 1, limit: number = 20, filters?: any): Promise<any> => {
    const response = await adminClient.get('/admin/users', {
      params: { page, limit, ...filters },
    })
    return response.data.data
  },

  /**
   * Suspend a user
   */
  suspendUser: async (userId: string, reason: string): Promise<any> => {
    const response = await adminClient.post(`/admin/users/${userId}/suspend`, { reason })
    return response.data
  },

  /**
   * Activate a user
   */
  activateUser: async (userId: string): Promise<any> => {
    const response = await adminClient.post(`/admin/users/${userId}/activate`)
    return response.data
  },
}

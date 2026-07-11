import { apiClient } from './client'

export interface CreateDisputeRequest {
  transactionId: string
  reason: 'DAMAGE' | 'NOT_RETURNED' | 'WRONG_CONDITION' | 'OTHER'
  description: string
  evidencePhotos?: string[]
}

export interface AddCounterEvidenceRequest {
  counterDescription: string
  counterEvidence?: string[]
}

export const disputesApi = {
  /**
   * Create a dispute for a transaction
   */
  createDispute: async (data: CreateDisputeRequest): Promise<any> => {
    const response = await apiClient.post('/disputes', data)
    return response.data
  },

  /**
   * Add counter-evidence to a dispute
   */
  addCounterEvidence: async (disputeId: string, data: AddCounterEvidenceRequest): Promise<any> => {
    const response = await apiClient.post(`/disputes/${disputeId}/counter-evidence`, data)
    return response.data
  },

  /**
   * Get dispute by ID
   */
  getDispute: async (disputeId: string): Promise<any> => {
    const response = await apiClient.get(`/disputes/${disputeId}`)
    return response.data.data.dispute
  },

  /**
   * Get all disputes for current user
   */
  getMyDisputes: async (): Promise<any> => {
    const response = await apiClient.get('/disputes/my-disputes')
    return response.data.data.disputes
  },
}

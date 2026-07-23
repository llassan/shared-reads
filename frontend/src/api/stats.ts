import axios from '../lib/axios'

export interface RecentBook {
  id: string
  title: string
  author: string
  images: string[]
  rentalType: 'FREE' | 'PAID'
  rentalPrice: number | null
  createdAt: string
}

export interface PublicStats {
  totalBooks: number
  totalReaders: number
  exchangedThisMonth: number
  recentBooks: RecentBook[]
}

export const statsApi = {
  getPublicStats: async (): Promise<PublicStats> => {
    const response = await axios.get('/stats')
    return response.data.data
  },
}

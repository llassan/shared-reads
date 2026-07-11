import axios from '../lib/axios'
import type { SearchBooksRequest, SearchBooksResponse } from '../types/book'

export const searchApi = {
  /**
   * Search for books
   */
  searchBooks: async (params: SearchBooksRequest): Promise<SearchBooksResponse['data']> => {
    const response = await axios.get<SearchBooksResponse>('/search', { params })
    return response.data.data
  },
}

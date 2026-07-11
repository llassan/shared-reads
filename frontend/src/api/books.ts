import axios from '../lib/axios'
import type { BookListing, CreateBookListingRequest } from '../types/book'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const booksApi = {
  /**
   * Create a new book listing
   */
  createListing: async (data: CreateBookListingRequest): Promise<BookListing> => {
    const formData = new FormData()

    // Add text fields
    formData.append('title', data.title)
    formData.append('author', data.author)
    if (data.description) formData.append('description', data.description)
    formData.append('condition', data.condition)
    formData.append('rentalType', data.rentalType)
    if (data.rentalPrice) formData.append('rentalPrice', data.rentalPrice.toString())
    if (data.depositAmount) formData.append('depositAmount', data.depositAmount.toString())
    formData.append('rentalDuration', data.rentalDuration.toString())
    formData.append('location', JSON.stringify(data.location))

    // Add image files
    data.images.forEach((file) => {
      formData.append('images', file)
    })

    const response = await axios.post<ApiResponse<{ bookListing: BookListing }>>(
      '/books',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data.bookListing
  },

  /**
   * Get my book listings
   */
  getMyListings: async (): Promise<BookListing[]> => {
    const response = await axios.get<ApiResponse<{ listings: BookListing[] }>>(
      '/books/my-listings'
    )
    return response.data.data.listings
  },

  /**
   * Get single book listing
   */
  getListing: async (id: string): Promise<BookListing> => {
    const response = await axios.get<ApiResponse<{ bookListing: BookListing }>>(
      `/books/${id}`
    )
    return response.data.data.bookListing
  },

  /**
   * Update book listing
   */
  updateListing: async (
    id: string,
    data: Partial<CreateBookListingRequest>
  ): Promise<BookListing> => {
    const formData = new FormData()

    // Add text fields if provided
    if (data.title) formData.append('title', data.title)
    if (data.author) formData.append('author', data.author)
    if (data.description) formData.append('description', data.description)
    if (data.condition) formData.append('condition', data.condition)
    if (data.rentalType) formData.append('rentalType', data.rentalType)
    if (data.rentalPrice) formData.append('rentalPrice', data.rentalPrice.toString())
    if (data.depositAmount) formData.append('depositAmount', data.depositAmount.toString())
    if (data.rentalDuration) formData.append('rentalDuration', data.rentalDuration.toString())
    if (data.location) formData.append('location', JSON.stringify(data.location))

    // Add new images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    const response = await axios.put<ApiResponse<{ bookListing: BookListing }>>(
      `/books/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data.bookListing
  },

  /**
   * Delete book listing
   */
  deleteListing: async (id: string): Promise<void> => {
    await axios.delete(`/books/${id}`)
  },

  /**
   * Toggle book availability
   */
  toggleAvailability: async (id: string, available?: boolean): Promise<BookListing> => {
    const response = await axios.patch<ApiResponse<{ bookListing: BookListing }>>(
      `/books/${id}/availability`,
      { available }
    )
    return response.data.data.bookListing
  },
}

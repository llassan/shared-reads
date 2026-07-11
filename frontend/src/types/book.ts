export type BookCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'ACCEPTABLE'
export type RentalType = 'FREE' | 'PAID'

export interface BookListing {
  id: string
  title: string
  author: string
  description: string | null
  condition: BookCondition
  rentalType: RentalType
  rentalPrice: number | null
  depositAmount: number | null
  rentalDuration: number
  images: string[]
  location: {
    lat: number
    lng: number
    address: string
  }
  available: boolean
  lenderId: string
  lender: {
    id: string
    name: string | null
    reputationScore: number
    profilePhoto: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface CreateBookListingRequest {
  title: string
  author: string
  description?: string
  condition: BookCondition
  rentalType: RentalType
  rentalPrice?: number
  depositAmount?: number
  rentalDuration: number
  images: File[]
  location: {
    lat: number
    lng: number
    address: string
  }
}

export interface SearchBooksRequest {
  query?: string
  latitude: number
  longitude: number
  radius?: number
  rentalType?: RentalType
  condition?: BookCondition
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export interface SearchBooksResponse {
  success: boolean
  data: {
    books: (BookListing & { distance: number })[]
    total: number
    page: number
    limit: number
  }
}

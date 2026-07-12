export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'

export interface User {
  id: string
  email: string
  phone: string | null
  name: string | null
  profilePhoto: string | null
  location: {
    lat: number
    lng: number
    address: string
  } | null
  emailVerified: boolean
  phoneVerified: boolean
  reputationScore: number
  accountStatus: AccountStatus
  createdAt: string
  lastLoginAt: string | null
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface RegisterRequest {
  email: string
  phone?: string
  password: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyOtpRequest {
  userId: string
  emailOtp: string
  phoneOtp?: string
}

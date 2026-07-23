import axios from '../lib/axios'
import type {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  AuthResponse,
  User,
} from '../types/user'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface RegisterResponse {
  userId: string
  email: string
  phone: string | null
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axios.post<ApiResponse<RegisterResponse>>(
      '/auth/register',
      data
    )
    return response.data.data
  },

  /**
   * Verify OTP codes
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse['data']> => {
    const response = await axios.post<AuthResponse>('/auth/verify-otp', data)

    // Store tokens
    localStorage.setItem('accessToken', response.data.data.accessToken)
    localStorage.setItem('refreshToken', response.data.data.refreshToken)

    return response.data.data
  },

  /**
   * Resend OTP
   */
  resendOtp: async (userId: string, type: 'email' | 'phone'): Promise<void> => {
    await axios.post('/auth/resend-otp', { userId, type })
  },

  /**
   * Login
   */
  login: async (data: LoginRequest): Promise<AuthResponse['data']> => {
    const response = await axios.post<AuthResponse>('/auth/login', data)

    // Store tokens
    localStorage.setItem('accessToken', response.data.data.accessToken)
    localStorage.setItem('refreshToken', response.data.data.refreshToken)

    return response.data.data
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    )

    const newAccessToken = response.data.data.accessToken
    localStorage.setItem('accessToken', newAccessToken)

    return newAccessToken
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const response = await axios.get<ApiResponse<{ user: User }>>('/auth/me')
    return response.data.data.user
  },

  /**
   * Update profile (name)
   */
  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await axios.patch<ApiResponse<{ user: User }>>('/auth/me', data)
    return response.data.data.user
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

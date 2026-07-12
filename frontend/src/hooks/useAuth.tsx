import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import type { User, RegisterRequest, LoginRequest, VerifyOtpRequest } from '../types/user'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (data: RegisterRequest) => Promise<{ userId: string; email: string; phone: string | null }>
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>
  resendOtp: (userId: string, type: 'email' | 'phone') => Promise<void>
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const queryClient = useQueryClient()

  // Check if user has valid token on mount
  const hasToken = !!localStorage.getItem('accessToken')

  // Fetch current user if token exists
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getMe,
    enabled: hasToken && isInitialized,
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
  })

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user)
    },
  })

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: ({ userId, type }: { userId: string; type: 'email' | 'phone' }) =>
      authApi.resendOtp(userId, type),
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user)
    },
  })

  // Logout function
  const logout = () => {
    authApi.logout()
    queryClient.setQueryData(['currentUser'], null)
    queryClient.clear()
    window.location.href = '/login'
  }

  const value: AuthContextType = {
    user: user || null,
    isLoading: !isInitialized || isLoading,
    isAuthenticated: !!user,
    register: registerMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    resendOtp: (userId: string, type: 'email' | 'phone') =>
      resendOtpMutation.mutateAsync({ userId, type }),
    login: loginMutation.mutateAsync,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Card } from '../components/common/Card'

const verifyOtpSchema = z.object({
  emailOtp: z.string().length(6, 'Email OTP must be 6 digits'),
  phoneOtp: z
    .string()
    .length(6, 'Phone OTP must be 6 digits')
    .optional()
    .or(z.literal('')),
})

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>

interface LocationState {
  userId: string
  email: string
  phone: string | null
}

export const VerifyOtpPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, resendOtp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState<'email' | 'phone' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const state = location.state as LocationState | null

  // Redirect if no state data
  if (!state || !state.userId) {
    return <Navigate to="/register" replace />
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  })

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      await verifyOtp({
        userId: state.userId,
        emailOtp: data.emailOtp,
        phoneOtp: state.phone ? data.phoneOtp || undefined : undefined,
      })

      // Navigate to dashboard on success
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check your OTP codes.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async (type: 'email' | 'phone') => {
    try {
      setIsResending(type)
      setError(null)
      setSuccessMessage(null)

      await resendOtp(state.userId, type)

      setSuccessMessage(`OTP sent to your ${type}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">Verify Your Account</h1>
          <p className="text-primary-700">
            {state.phone
              ? "We've sent verification codes to your email and phone"
              : "We've sent a verification code to your email"}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Check your inbox</p>
              <p>Email: {state.email}</p>
              {state.phone && <p>Phone: {state.phone}</p>}
            </div>

            <div>
              <Input
                label="Email OTP"
                type="text"
                placeholder="6-digit code"
                maxLength={6}
                error={errors.emailOtp?.message}
                {...register('emailOtp')}
              />
              <button
                type="button"
                onClick={() => handleResendOtp('email')}
                disabled={isResending === 'email'}
                className="mt-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {isResending === 'email' ? 'Sending...' : 'Resend email OTP'}
              </button>
            </div>

            {state.phone && (
              <div>
                <Input
                  label="Phone OTP"
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  error={errors.phoneOtp?.message}
                  {...register('phoneOtp')}
                />
                <button
                  type="button"
                  onClick={() => handleResendOtp('phone')}
                  disabled={isResending === 'phone'}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isResending === 'phone' ? 'Sending...' : 'Resend phone OTP'}
                </button>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify & Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

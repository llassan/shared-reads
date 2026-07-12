import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'

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
    <AuthLayout
      title="Check your inbox"
      subtitle={
        state.phone
          ? 'We sent verification codes to your email and phone.'
          : 'We sent a 6-digit verification code to your email.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex items-start gap-3 bg-accent-50 border border-accent-200 text-stone-700 px-4 py-3 rounded-xl text-sm">
          <MailCheck className="h-4.5 w-4.5 h-[18px] w-[18px] mt-0.5 text-accent-600 shrink-0" />
          <div>
            <p className="font-medium">{state.email}</p>
            {state.phone && <p className="text-stone-500">{state.phone}</p>}
          </div>
        </div>

        <div>
          <Input
            label="Email code"
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
            className="mt-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 disabled:opacity-50"
          >
            {isResending === 'email' ? 'Sending…' : 'Resend email code'}
          </button>
        </div>

        {state.phone && (
          <div>
            <Input
              label="Phone code"
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
              className="mt-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 disabled:opacity-50"
            >
              {isResending === 'phone' ? 'Sending…' : 'Resend phone code'}
            </button>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Verify & continue
        </Button>
      </form>
    </AuthLayout>
  )
}

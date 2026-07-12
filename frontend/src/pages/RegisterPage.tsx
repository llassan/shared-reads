import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Use international format, e.g. +14155551234')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await registerUser({
        ...data,
        phone: data.phone || undefined,
      })

      navigate('/verify-otp', {
        state: {
          userId: result.userId,
          email: result.email,
          phone: result.phone,
        },
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join readers sharing books around the world — free, forever."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Name (optional)"
          type="text"
          placeholder="How should we introduce you?"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+14155551234"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Create account
        </Button>

        <p className="text-center text-sm text-stone-500">
          Already a member?{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

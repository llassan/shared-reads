import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { adminApi } from '../api/admin'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'

export const AdminLoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => adminApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.data.token)
      localStorage.setItem('adminData', JSON.stringify(data.data.admin))
      navigate('/admin/dashboard')
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(36rem 22rem at 10% 0%, #29533f 0%, transparent 60%), radial-gradient(28rem 18rem at 90% 100%, #f59e0b22 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img src="/logo.svg" alt="" className="h-10 w-10 rounded-xl" />
          <span className="font-display text-2xl font-semibold text-white">SharedReads</span>
          <span className="badge bg-accent-500 text-primary-950 ml-1">Admin</span>
        </div>

        <div className="card !p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-10 w-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">Admin portal</h1>
              <p className="text-sm text-stone-500">Platform administration</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sharedreads.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button type="submit" isLoading={loginMutation.isPending} className="w-full">
              Log in to admin portal
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-primary-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sharedreads.com
          </button>
        </div>
      </div>
    </div>
  )
}

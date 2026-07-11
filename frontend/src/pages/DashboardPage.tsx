import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">SharedReads</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Your account is verified and ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Account Information
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Email:</span> {user.email}
                {user.emailVerified && (
                  <span className="ml-2 text-green-600">✓ Verified</span>
                )}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {user.phone}
                {user.phoneVerified && (
                  <span className="ml-2 text-green-600">✓ Verified</span>
                )}
              </p>
              <p>
                <span className="font-medium">Reputation Score:</span>{' '}
                {user.reputationScore.toFixed(1)} / 5.0
              </p>
              <p>
                <span className="font-medium">Account Status:</span>{' '}
                <span className="text-green-600">{user.accountStatus}</span>
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => (window.location.href = '/list-book')}
              >
                📚 List a Book
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => (window.location.href = '/my-listings')}
              >
                📖 My Listings
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => (window.location.href = '/search')}
              >
                🔍 Search Books
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => (window.location.href = '/my-requests')}
              >
                📬 My Requests
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => (window.location.href = '/incoming-requests')}
              >
                📥 Incoming Requests
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

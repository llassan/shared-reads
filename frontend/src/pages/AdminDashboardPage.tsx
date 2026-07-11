import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'stats' | 'disputes' | 'users'>('stats')
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionOutcome, setResolutionOutcome] = useState<string>('REFUND_TO_BORROWER')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  })

  const { data: disputes } = useQuery({
    queryKey: ['pendingDisputes'],
    queryFn: adminApi.getPendingDisputes,
  })

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getAllUsers(1, 20),
  })

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ disputeId, data }: any) => adminApi.resolveDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setSelectedDispute(null)
      setResolutionNotes('')
    },
  })

  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: any) => adminApi.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    navigate('/admin/login')
  }

  const handleResolveDispute = () => {
    if (!selectedDispute) return

    if (confirm(`Resolve dispute with outcome: ${resolutionOutcome}?`)) {
      resolveDisputeMutation.mutate({
        disputeId: selectedDispute.id,
        data: {
          resolutionOutcome,
          resolutionNotes: resolutionNotes.trim() || undefined,
        },
      })
    }
  }

  const handleSuspendUser = (userId: string, userName: string) => {
    const reason = prompt(`Reason for suspending ${userName}:`)
    if (reason && reason.trim()) {
      suspendUserMutation.mutate({ userId, reason: reason.trim() })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SharedReads Admin Dashboard</h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Platform Stats
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'disputes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Disputes ({disputes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                Active: {stats.users.active} | Suspended: {stats.users.suspended}
              </p>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Books</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.books.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                Available: {stats.books.available} | Borrowed: {stats.books.borrowed}
              </p>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Transactions</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.transactions.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                Completed: {stats.transactions.completed}
              </p>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">₹{stats.revenue.total.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Platform fees collected</p>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Disputes</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.disputes.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                Pending: {stats.disputes.pending} | Resolved: {stats.disputes.resolved}
              </p>
            </Card>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            {disputes && disputes.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 py-8">No pending disputes</p>
              </Card>
            ) : (
              disputes?.map((dispute: any) => (
                <Card key={dispute.id}>
                  <div className="space-y-4">
                    {/* Book & Transaction Info */}
                    <div className="flex gap-4 pb-4 border-b">
                      <img
                        src={dispute.transaction.bookListing.images[0]}
                        alt={dispute.transaction.bookListing.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {dispute.transaction.bookListing.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Raised by: {dispute.raisedBy.name || dispute.raisedBy.email}
                        </p>
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded mt-1">
                          {dispute.reason.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Dispute Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                      <p className="text-sm text-gray-700">{dispute.description}</p>
                    </div>

                    {/* Evidence */}
                    {dispute.evidencePhotos && dispute.evidencePhotos.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Evidence Photos:</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {dispute.evidencePhotos.map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Counter Evidence */}
                    {dispute.counterDescription && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Counter-Evidence:</h4>
                        <p className="text-sm text-gray-700 mb-2">{dispute.counterDescription}</p>
                        {dispute.counterEvidence && dispute.counterEvidence.length > 0 && (
                          <div className="grid grid-cols-4 gap-2">
                            {dispute.counterEvidence.map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Counter ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Borrower:</h4>
                        <p>{dispute.transaction.borrower.name || 'Anonymous'}</p>
                        <p className="text-gray-600">
                          ⭐ {dispute.transaction.borrower.reputationScore.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Lender:</h4>
                        <p>{dispute.transaction.lender.name || 'Anonymous'}</p>
                        <p className="text-gray-600">
                          ⭐ {dispute.transaction.lender.reputationScore.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Resolution */}
                    {selectedDispute?.id === dispute.id ? (
                      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution Outcome
                          </label>
                          <select
                            value={resolutionOutcome}
                            onChange={(e) => setResolutionOutcome(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="REFUND_TO_BORROWER">Refund to Borrower</option>
                            <option value="KEEP_WITH_LENDER">Keep with Lender</option>
                            <option value="SPLIT_50_50">Split 50/50</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution Notes (Optional)
                          </label>
                          <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Add any notes about this resolution..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleResolveDispute}
                            isLoading={resolveDisputeMutation.isPending}
                          >
                            Confirm Resolution
                          </Button>
                          <Button variant="secondary" onClick={() => setSelectedDispute(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => setSelectedDispute(dispute)}>Resolve Dispute</Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && usersData && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Reputation</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user: any) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">{user.name || 'Anonymous'}</td>
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.phone}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm">⭐ {user.reputationScore.toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            user.accountStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.accountStatus === 'ACTIVE' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id, user.name || user.email)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Activate user ${user.name || user.email}?`)) {
                                activateUserMutation.mutate(user.id)
                              }
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestsApi } from '../api/requests'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Header } from '../components/layout/Header'

export const IncomingRequestsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({})

  const { data: requests, isLoading } = useQuery({
    queryKey: ['incomingRequests'],
    queryFn: requestsApi.getIncomingRequests,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => requestsApi.approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      requestsApi.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] })
      setRejectionReason({})
    },
  })

  const handleApprove = async (id: string) => {
    if (confirm('Approve this borrow request? This will create a transaction.')) {
      await approveMutation.mutateAsync(id)
    }
  }

  const handleReject = async (id: string) => {
    const reason = rejectionReason[id]
    if (!reason || reason.trim().length < 5) {
      alert('Please provide a reason for rejection (min 5 characters)')
      return
    }

    if (confirm('Reject this borrow request?')) {
      await rejectMutation.mutateAsync({ id, reason })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  const pendingRequests = requests?.filter((r) => r.status === 'PENDING') || []
  const processedRequests = requests?.filter((r) => r.status !== 'PENDING') || []

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">Incoming Requests</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Book Image */}
                    <img
                      src={request.bookListing.images[0]}
                      alt={request.bookListing.title}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.bookListing.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        by {request.bookListing.author}
                      </p>

                      <div className="flex items-center gap-3">
                        {request.borrower.profilePhoto ? (
                          <img
                            src={request.borrower.profilePhoto}
                            alt={request.borrower.name || 'Borrower'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 text-sm font-semibold">
                              {(request.borrower.name || 'B')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {request.borrower.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-600">
                            ⭐ {request.borrower.reputationScore.toFixed(1)} rating
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>

                      {/* Rejection Reason Input */}
                      <Input
                        placeholder="Reason for rejection (if rejecting)"
                        value={rejectionReason[request.id] || ''}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [request.id]: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        isLoading={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                        isLoading={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Processed Requests ({processedRequests.length})
            </h2>
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={request.bookListing.images[0]}
                      alt={request.bookListing.title}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.bookListing.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Borrower: {request.borrower.name || 'Anonymous'}
                      </p>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status}
                      </span>

                      {request.status === 'REJECTED' && request.rejectionReason && (
                        <p className="text-sm text-gray-600">
                          Reason: {request.rejectionReason}
                        </p>
                      )}

                      {request.status === 'APPROVED' && request.transaction && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            Payment Status:{' '}
                            <span
                              className={
                                request.transaction.paymentStatus === 'COMPLETED'
                                  ? 'text-green-600 font-medium'
                                  : 'text-yellow-600 font-medium'
                              }
                            >
                              {request.transaction.paymentStatus}
                            </span>
                          </p>
                          {request.transaction.paymentStatus === 'COMPLETED' && (
                            <Button
                              variant="secondary"
                              onClick={() => navigate(`/transactions/${request.transaction.id}`)}
                              className="mt-2"
                            >
                              View Transaction
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!requests || requests.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No incoming requests
            </h2>
            <p className="text-gray-600">
              When someone requests to borrow your books, they'll appear here
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

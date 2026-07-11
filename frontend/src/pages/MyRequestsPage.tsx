import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestsApi } from '../api/requests'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const MyRequestsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: requestsApi.getMyRequests,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => requestsApi.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
    },
  })

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this borrow request?')) {
      await cancelMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">My Requests</h1>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/search')}>Search Books</Button>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!requests || requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📬</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No borrow requests yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start browsing books and send requests to borrow!
            </p>
            <Button onClick={() => navigate('/search')}>Search Books</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
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

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-600">
                        Lender: {request.lender.name || 'Anonymous'}
                      </span>
                      <span className="text-gray-600">
                        Duration: {request.bookListing.rentalDuration} days
                      </span>
                      {request.bookListing.rentalType === 'PAID' && (
                        <span className="text-gray-600">
                          Price: ₹{request.bookListing.rentalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>

                      {request.status === 'REJECTED' && request.rejectionReason && (
                        <span className="text-sm text-gray-600">
                          Reason: {request.rejectionReason}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-2">
                    {request.status === 'PENDING' && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(request.id)}
                        isLoading={cancelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}

                    {request.status === 'APPROVED' && request.transaction && (
                      <>
                        {request.transaction.paymentStatus === 'PENDING' ? (
                          <Button onClick={() => navigate(`/payments/${request.transaction.id}`)}>
                            Pay Now
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => navigate(`/transactions/${request.transaction.id}`)}
                          >
                            View Transaction
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

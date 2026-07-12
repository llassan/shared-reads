import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Send, Clock, CreditCard, ArrowRight } from 'lucide-react'
import { requestsApi } from '../api/requests'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { PageTitle } from '../components/common/PageTitle'
import { EmptyState } from '../components/common/EmptyState'
import { StatusBadge } from '../components/common/StatusBadge'
import { formatMoney } from '../lib/format'

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

  return (
    <PageShell>
      <PageTitle
        title="My requests"
        subtitle="Books you've asked to borrow from other readers."
        actions={
          <Button variant="secondary" onClick={() => navigate('/search')}>
            <Search className="h-4 w-4" /> Browse books
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-5">
              <div className="w-24 h-32 bg-stone-100 rounded-xl shrink-0" />
              <div className="flex-1 py-2">
                <div className="h-4 bg-stone-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-1/4 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No borrow requests yet"
          body="Find a book you'd love to read nearby and send your first request."
          action={
            <Button onClick={() => navigate('/search')}>
              <Search className="h-4 w-4" /> Browse books nearby
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card flex flex-col md:flex-row gap-5">
              <img
                src={request.bookListing.images[0]}
                alt={request.bookListing.title}
                className="w-full md:w-24 h-40 md:h-32 object-cover rounded-xl shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-ink">{request.bookListing.title}</h3>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-0.5 text-sm text-stone-500">
                  by {request.bookListing.author}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-500">
                  <span>Lender: {request.lender.name || 'Anonymous'}</span>
                  <span>{request.bookListing.rentalDuration} days</span>
                  {request.bookListing.rentalType === 'PAID' && (
                    <span>{formatMoney(request.bookListing.rentalPrice!)} / loan</span>
                  )}
                </div>

                {request.status === 'REJECTED' && request.rejectionReason && (
                  <p className="mt-2 text-sm text-red-600">
                    Reason: {request.rejectionReason}
                  </p>
                )}

                <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
                  <Clock className="h-3.5 w-3.5" />
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex md:flex-col justify-end md:justify-center gap-2 shrink-0">
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
                        <CreditCard className="h-4 w-4" /> Pay now
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/transactions/${request.transaction.id}`)}
                      >
                        View loan <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

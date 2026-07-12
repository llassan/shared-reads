import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Inbox, Star, Clock, Check, X, ArrowRight } from 'lucide-react'
import { requestsApi } from '../api/requests'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { PageShell } from '../components/layout/PageShell'
import { PageTitle } from '../components/common/PageTitle'
import { EmptyState } from '../components/common/EmptyState'
import { StatusBadge } from '../components/common/StatusBadge'

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

  const pendingRequests = requests?.filter((r) => r.status === 'PENDING') || []
  const processedRequests = requests?.filter((r) => r.status !== 'PENDING') || []

  return (
    <PageShell>
      <PageTitle
        title="Incoming requests"
        subtitle="Readers who want to borrow your books."
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
          icon={Inbox}
          title="No incoming requests"
          body="When someone nearby asks to borrow one of your books, it will show up here."
        />
      ) : (
        <>
          {/* Pending */}
          {pendingRequests.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">
                Waiting for you ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="card !border-accent-300/70 flex flex-col md:flex-row gap-5"
                  >
                    <img
                      src={request.bookListing.images[0]}
                      alt={request.bookListing.title}
                      className="w-full md:w-24 h-40 md:h-32 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink">
                        {request.bookListing.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-stone-500">
                        by {request.bookListing.author}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        {request.borrower.profilePhoto ? (
                          <img
                            src={request.borrower.profilePhoto}
                            alt={request.borrower.name || 'Borrower'}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 text-sm font-semibold">
                              {(request.borrower.name || 'B')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {request.borrower.name || 'Anonymous'}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-stone-500">
                            <Star className="h-3 w-3 text-accent-500 fill-accent-400" />
                            {request.borrower.reputationScore.toFixed(1)} rating
                          </p>
                        </div>
                        <p className="ml-auto flex items-center gap-1.5 text-xs text-stone-400">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-3">
                        <Input
                          placeholder="Reason for rejection (only needed if rejecting)"
                          value={rejectionReason[request.id] || ''}
                          onChange={(e) =>
                            setRejectionReason({
                              ...rejectionReason,
                              [request.id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-end md:justify-center gap-2 shrink-0">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        isLoading={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                        isLoading={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed */}
          {processedRequests.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">
                Earlier ({processedRequests.length})
              </h2>
              <div className="space-y-4">
                {processedRequests.map((request) => (
                  <div key={request.id} className="card flex flex-col md:flex-row gap-5">
                    <img
                      src={request.bookListing.images[0]}
                      alt={request.bookListing.title}
                      className="w-full md:w-24 h-40 md:h-32 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-ink">
                          {request.bookListing.title}
                        </h3>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-stone-500">
                        Borrower: {request.borrower.name || 'Anonymous'}
                      </p>

                      {request.status === 'REJECTED' && request.rejectionReason && (
                        <p className="mt-2 text-sm text-stone-500">
                          Reason: {request.rejectionReason}
                        </p>
                      )}

                      {request.status === 'APPROVED' && request.transaction && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StatusBadge status={request.transaction.paymentStatus} />
                          {request.transaction.paymentStatus === 'COMPLETED' && (
                            <Button
                              variant="secondary"
                              onClick={() =>
                                navigate(`/transactions/${request.transaction.id}`)
                              }
                            >
                              View loan <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}

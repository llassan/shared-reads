import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Star, SearchX, Ban } from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { reviewsApi } from '../api/reviews'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { EmptyState } from '../components/common/EmptyState'

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

export const CreateReviewPage = () => {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionsApi.getTransaction(transactionId!),
    enabled: !!transactionId,
  })

  const { data: canReviewData } = useQuery({
    queryKey: ['canReview', transactionId],
    queryFn: () => reviewsApi.canReviewTransaction(transactionId!),
    enabled: !!transactionId,
  })

  const createReviewMutation = useMutation({
    mutationFn: (data: { transactionId: string; rating: number; comment?: string }) =>
      reviewsApi.createReview(data),
    onSuccess: () => {
      navigate(`/transactions/${transactionId}?review=success`)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to submit review')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    createReviewMutation.mutate({
      transactionId: transactionId!,
      rating,
      comment: comment.trim() || undefined,
    })
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-96 bg-stone-100 rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (!transaction) {
    return (
      <PageShell>
        <EmptyState
          icon={SearchX}
          title="Loan not found"
          body="This transaction doesn't exist or you don't have access to it."
          action={<Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
        />
      </PageShell>
    )
  }

  if (canReviewData && !canReviewData.canReview) {
    return (
      <PageShell>
        <EmptyState
          icon={Ban}
          title="Can't review this loan"
          body={canReviewData.reason || 'This loan is not eligible for a review right now.'}
          action={
            <Button onClick={() => navigate(`/transactions/${transactionId}`)}>
              Back to loan
            </Button>
          }
        />
      </PageShell>
    )
  }

  const isBorrower = user?.userId === transaction.borrowerId
  const reviewee = isBorrower ? transaction.lender : transaction.borrower

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/transactions/${transactionId}`)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to loan
        </button>

        <h1 className="font-display text-4xl font-semibold text-primary-950 mb-8">
          Leave a review
        </h1>

        <div className="card !p-7">
          {/* Context */}
          <div className="flex gap-4 pb-6 border-b border-stone-100">
            <img
              src={transaction.bookListing.images[0]}
              alt={transaction.bookListing.title}
              className="w-16 h-24 object-cover rounded-xl shrink-0"
            />
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                {transaction.bookListing.title}
              </p>
              <p className="text-sm text-stone-500">by {transaction.bookListing.author}</p>
              <p className="mt-2 text-sm text-stone-500">
                Reviewing {isBorrower ? 'the lender' : 'the borrower'}:{' '}
                <span className="font-medium text-ink">{reviewee.name || 'Anonymous'}</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl my-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            {/* Star Rating */}
            <div>
              <label className="label">How was the experience?</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={
                        star <= (hoveredRating || rating)
                          ? 'h-9 w-9 text-accent-500 fill-accent-400'
                          : 'h-9 w-9 text-stone-200 fill-stone-100'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-stone-500 mt-2">{RATING_LABELS[rating]}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="input min-h-[100px]"
                placeholder={`Share your experience with ${reviewee.name || 'this reader'}…`}
              />
            </div>

            <Button
              type="submit"
              isLoading={createReviewMutation.isPending}
              disabled={rating === 0}
              className="w-full"
            >
              Submit review
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}

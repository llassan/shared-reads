import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import { reviewsApi } from '../api/reviews'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Header } from '../components/layout/Header'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (canReviewData && !canReviewData.canReview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cannot Review</h2>
            <p className="text-gray-600 mb-6">{canReviewData.reason}</p>
            <Button onClick={() => navigate(`/transactions/${transactionId}`)}>
              Back to Transaction
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const isBorrower = user?.userId === transaction.borrowerId
  const reviewee = isBorrower ? transaction.lender : transaction.borrower

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" onClick={() => navigate(`/transactions/${transactionId}`)}>
            ← Back to Transaction
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h1>

          {/* Book Info */}
          <div className="mb-6">
            <div className="flex gap-4">
              <img
                src={transaction.bookListing.images[0]}
                alt={transaction.bookListing.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{transaction.bookListing.title}</h3>
                <p className="text-sm text-gray-600">by {transaction.bookListing.author}</p>
              </div>
            </div>
          </div>

          {/* Reviewee Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              You are reviewing {isBorrower ? 'the lender' : 'the borrower'}:
            </h3>
            <div className="flex items-center gap-3">
              {reviewee.profilePhoto ? (
                <img
                  src={reviewee.profilePhoto}
                  alt={reviewee.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-lg">
                    {(reviewee.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">{reviewee.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">⭐ {reviewee.reputationScore.toFixed(1)} rating</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-4xl focus:outline-none transition-colors"
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={`Share your experience with ${reviewee.name || 'this user'}...`}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isLoading={createReviewMutation.isPending}
              disabled={rating === 0}
              className="w-full"
            >
              Submit Review
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}

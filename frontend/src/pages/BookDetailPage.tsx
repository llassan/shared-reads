import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Star, BookOpen, BookX, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { booksApi } from '../api/books'
import { requestsApi } from '../api/requests'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { EmptyState } from '../components/common/EmptyState'
import { formatMoney } from '../lib/format'

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksApi.getListing(id!),
    enabled: !!id,
  })

  const requestMutation = useMutation({
    mutationFn: () => requestsApi.createRequest(id!),
    onSuccess: () => {
      setSuccess('Borrow request sent successfully!')
      setError(null)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to send request')
      setSuccess(null)
    },
  })

  const handleBorrowRequest = () => {
    if (confirm('Send a borrow request for this book?')) {
      requestMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-96 bg-stone-100 rounded-2xl" />
          <div className="py-2">
            <div className="h-8 bg-stone-100 rounded w-2/3 mb-4" />
            <div className="h-4 bg-stone-100 rounded w-1/3 mb-8" />
            <div className="h-40 bg-stone-100 rounded-2xl" />
          </div>
        </div>
      </PageShell>
    )
  }

  if (!book) {
    return (
      <PageShell>
        <EmptyState
          icon={BookX}
          title="Book not found"
          body="This listing may have been removed by its owner."
          action={<Button onClick={() => navigate('/search')}>Back to browse</Button>}
        />
      </PageShell>
    )
  }

  const isOwnBook = user?.userId === book.lender.id

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/search')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl mb-6 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>{success}</span>
            <Button variant="secondary" onClick={() => navigate('/my-requests')}>
              View my requests <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <img
              src={book.images[selectedImage]}
              alt={book.title}
              className="w-full h-96 object-cover rounded-2xl shadow-card mb-3"
            />

            {book.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {book.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    className={clsx(
                      'w-full h-20 object-cover rounded-xl cursor-pointer border-2 transition-colors',
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-transparent hover:border-stone-300'
                    )}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {book.rentalType === 'FREE' ? (
                  <span className="badge bg-primary-800 text-white">Free to borrow</span>
                ) : (
                  <span className="badge bg-accent-400 text-primary-950">
                    {formatMoney(book.rentalPrice!)} / loan
                  </span>
                )}
                <span
                  className={clsx(
                    'badge',
                    book.available
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-stone-100 text-stone-600'
                  )}
                >
                  {book.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold text-primary-950">
                {book.title}
              </h1>
              <p className="mt-2 text-lg text-stone-500">by {book.author}</p>
            </div>

            {book.description && (
              <p className="text-stone-600 leading-relaxed">{book.description}</p>
            )}

            <div className="card">
              <h3 className="font-semibold text-ink mb-4">Loan details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Condition</dt>
                  <dd className="font-medium text-ink capitalize">
                    {book.condition.replace('_', ' ').toLowerCase()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Loan period</dt>
                  <dd className="font-medium text-ink">{book.rentalDuration} days</dd>
                </div>
                {book.rentalType === 'PAID' && book.depositAmount && (
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Refundable deposit</dt>
                    <dd className="font-medium text-ink">{formatMoney(book.depositAmount)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="card">
              <h3 className="font-semibold text-ink mb-4">Shared by</h3>
              <div className="flex items-center gap-3">
                {book.lender.profilePhoto ? (
                  <img
                    src={book.lender.profilePhoto}
                    alt={book.lender.name || 'Lender'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {(book.lender.name || 'L')[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <div>
                  <p className="font-medium text-ink">{book.lender.name || 'Anonymous'}</p>
                  <p className="flex items-center gap-1 text-sm text-stone-500">
                    <Star className="h-3.5 w-3.5 text-accent-500 fill-accent-400" />
                    {book.lender.reputationScore.toFixed(1)} rating
                  </p>
                </div>
              </div>
            </div>

            {isOwnBook ? (
              <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl text-sm">
                This is your own listing.
              </div>
            ) : !book.available ? (
              <div className="bg-accent-50 border border-accent-200 text-stone-700 px-4 py-3 rounded-xl text-sm">
                This book is currently out with another reader.
              </div>
            ) : success ? null : (
              <Button
                onClick={handleBorrowRequest}
                isLoading={requestMutation.isPending}
                className="w-full"
              >
                <BookOpen className="h-4 w-4" /> Request to borrow
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

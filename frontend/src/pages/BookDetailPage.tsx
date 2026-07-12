import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { booksApi } from '../api/books'
import { requestsApi } from '../api/requests'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Header } from '../components/layout/Header'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Book not found</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    )
  }

  const isOwnBook = user?.userId === book.lender.id

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" onClick={() => navigate('/search')}>
            ← Back to Search
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
            <Button
              variant="secondary"
              onClick={() => navigate('/my-requests')}
              className="ml-4"
            >
              View My Requests
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <img
              src={book.images[selectedImage]}
              alt={book.title}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />

            {book.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {book.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            {book.description && (
              <p className="text-gray-700">{book.description}</p>
            )}

            <Card>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Book Details</h3>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{book.condition.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Type:</span>
                  <span className="font-medium">
                    {book.rentalType === 'FREE' ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${book.rentalPrice} for ${book.rentalDuration} days`
                    )}
                  </span>
                </div>

                {book.rentalType === 'PAID' && book.depositAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit Required:</span>
                    <span className="font-medium">${book.depositAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{book.rentalDuration} days</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Availability:</span>
                  <span className={`font-medium ${book.available ? 'text-green-600' : 'text-red-600'}`}>
                    {book.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Lender Information</h3>

                <div className="flex items-center gap-3">
                  {book.lender.profilePhoto ? (
                    <img
                      src={book.lender.profilePhoto}
                      alt={book.lender.name || 'Lender'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {(book.lender.name || 'L')[0].toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="font-medium">{book.lender.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">
                      ⭐ {book.lender.reputationScore.toFixed(1)} rating
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            {isOwnBook ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                This is your own book listing
              </div>
            ) : !book.available ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                This book is currently unavailable
              </div>
            ) : success ? null : (
              <Button
                onClick={handleBorrowRequest}
                isLoading={requestMutation.isPending}
                className="w-full"
              >
                📖 Request to Borrow
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

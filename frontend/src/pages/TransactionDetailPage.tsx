import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import { reviewsApi } from '../api/reviews'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export const TransactionDetailPage = () => {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const reviewSuccess = searchParams.get('review') === 'success'

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'handover' | 'return'>('handover')

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionsApi.getTransaction(transactionId!),
    enabled: !!transactionId,
  })

  const { data: reviews } = useQuery({
    queryKey: ['transactionReviews', transactionId],
    queryFn: () => reviewsApi.getTransactionReviews(transactionId!),
    enabled: !!transactionId,
  })

  const { data: canReviewData } = useQuery({
    queryKey: ['canReview', transactionId],
    queryFn: () => reviewsApi.canReviewTransaction(transactionId!),
    enabled: !!transactionId && transaction?.status === 'COMPLETED',
  })

  const handoverMutation = useMutation({
    mutationFn: (photoBase64: string) =>
      transactionsApi.confirmHandover(transactionId!, { photoBase64 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
      setShowPhotoUpload(false)
      setPhotoFile(null)
      setPhotoPreview(null)
    },
  })

  const returnMutation = useMutation({
    mutationFn: (photoBase64: string) =>
      transactionsApi.confirmReturn(transactionId!, { photoBase64 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
      setShowPhotoUpload(false)
      setPhotoFile(null)
      setPhotoPreview(null)
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => transactionsApi.completeTransaction(transactionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoSubmit = async () => {
    if (!photoFile || !photoPreview) return

    if (uploadType === 'handover') {
      await handoverMutation.mutateAsync(photoPreview)
    } else {
      await returnMutation.mutateAsync(photoPreview)
    }
  }

  const handleCompleteTransaction = () => {
    if (confirm('Confirm that the book was returned in acceptable condition? This will release the deposit to the borrower and complete the transaction.')) {
      completeMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
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

  const isBorrower = user?.userId === transaction.borrowerId
  const isLender = user?.userId === transaction.lenderId

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return 'bg-yellow-100 text-yellow-800'
      case 'DEPOSIT_PAID':
        return 'bg-blue-100 text-blue-800'
      case 'BOOK_RECEIVED':
        return 'bg-purple-100 text-purple-800'
      case 'BOOK_RETURNED':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'DISPUTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalAmount =
    (Number(transaction.depositAmount) || 0) +
    (Number(transaction.rentalAmount) || 0) +
    (Number(transaction.platformFee) || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">Transaction Details</h1>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paymentSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ Payment completed successfully! The lender will be notified to arrange book handover.
          </div>
        )}

        {reviewSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ Review submitted successfully! Thank you for your feedback.
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {uploadType === 'handover' ? 'Confirm Book Handover' : 'Confirm Book Return'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {uploadType === 'handover'
                ? 'Take a photo of the book before handing it over to the borrower. This serves as evidence of the book\'s condition.'
                : 'Take a photo of the book when returning it to the lender. This serves as evidence of the book\'s condition upon return.'}
            </p>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="mb-4"
            />

            {photoPreview && (
              <div className="mb-4">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handlePhotoSubmit}
                isLoading={handoverMutation.isPending || returnMutation.isPending}
                disabled={!photoFile}
              >
                Confirm {uploadType === 'handover' ? 'Handover' : 'Return'}
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowPhotoUpload(false)
                setPhotoFile(null)
                setPhotoPreview(null)
              }}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Status Card */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Status</h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                transaction.status
              )}`}
            >
              {transaction.status.replace('_', ' ')}
            </span>
          </div>

          {/* Book Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Book</h3>
            <div className="flex gap-4">
              <img
                src={transaction.bookListing.images[0]}
                alt={transaction.bookListing.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {transaction.bookListing.title}
                </h4>
                <p className="text-gray-600">by {transaction.bookListing.author}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Duration: {transaction.bookListing.rentalDuration} days
                </p>
                <p className="text-sm text-gray-500">Condition: {transaction.bookListing.condition}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Borrower */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Borrower</h3>
              <div className="flex items-center gap-3">
                {transaction.borrower.profilePhoto ? (
                  <img
                    src={transaction.borrower.profilePhoto}
                    alt={transaction.borrower.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {(transaction.borrower.name || 'B')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {transaction.borrower.name || 'Anonymous'}
                    {isBorrower && <span className="text-sm text-gray-500"> (You)</span>}
                  </p>
                  <p className="text-sm text-gray-600">
                    ⭐ {transaction.borrower.reputationScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Lender */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lender</h3>
              <div className="flex items-center gap-3">
                {transaction.lender.profilePhoto ? (
                  <img
                    src={transaction.lender.profilePhoto}
                    alt={transaction.lender.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {(transaction.lender.name || 'L')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {transaction.lender.name || 'Anonymous'}
                    {isLender && <span className="text-sm text-gray-500"> (You)</span>}
                  </p>
                  <p className="text-sm text-gray-600">
                    ⭐ {transaction.lender.reputationScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              {transaction.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-medium">₹{Number(transaction.depositAmount).toFixed(2)}</span>
                </div>
              )}
              {transaction.rentalAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee:</span>
                  <span className="font-medium">₹{Number(transaction.rentalAmount).toFixed(2)}</span>
                </div>
              )}
              {transaction.platformFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-medium">₹{Number(transaction.platformFee).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Paid:</span>
                <span className="text-primary-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <span
                  className={`font-medium ${
                    transaction.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {transaction.paymentStatus}
                </span>
              </div>
              {transaction.depositPaidAt && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Paid At:</span>
                  <span>{new Date(transaction.depositPaidAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Photos */}
          {(transaction.beforeHandoverPhoto || transaction.afterReturnPhoto) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Evidence Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.beforeHandoverPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before Handover:</p>
                    <img
                      src={transaction.beforeHandoverPhoto}
                      alt="Before handover"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {transaction.afterReturnPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After Return:</p>
                    <img
                      src={transaction.afterReturnPhoto}
                      alt="After return"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-l-4 border-primary-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      {review.reviewer.profilePhoto ? (
                        <img
                          src={review.reviewer.profilePhoto}
                          alt={review.reviewer.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-xs font-semibold">
                            {(review.reviewer.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{review.reviewer.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                          <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Created:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              {transaction.depositPaidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit Paid:</span>
                  <span>{new Date(transaction.depositPaidAt).toLocaleString()}</span>
                </div>
              )}
              {transaction.handoverAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Book Handed Over:</span>
                  <span>{new Date(transaction.handoverAt).toLocaleString()}</span>
                </div>
              )}
              {transaction.returnedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Book Returned:</span>
                  <span>{new Date(transaction.returnedAt).toLocaleString()}</span>
                </div>
              )}
              {transaction.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Completed:</span>
                  <span>{new Date(transaction.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          {/* Borrower: Pay deposit */}
          {isBorrower && transaction.status === 'INITIATED' && transaction.paymentStatus === 'PENDING' && (
            <Button onClick={() => navigate(`/payments/${transactionId}`)} className="w-full">
              Complete Payment
            </Button>
          )}

          {/* Lender: Confirm handover */}
          {isLender && transaction.status === 'DEPOSIT_PAID' && !showPhotoUpload && (
            <Button
              onClick={() => {
                setUploadType('handover')
                setShowPhotoUpload(true)
              }}
              className="w-full"
            >
              Confirm Book Handover
            </Button>
          )}

          {/* Borrower: Confirm return */}
          {isBorrower && transaction.status === 'BOOK_RECEIVED' && !showPhotoUpload && (
            <Button
              onClick={() => {
                setUploadType('return')
                setShowPhotoUpload(true)
              }}
              className="w-full"
            >
              Confirm Book Return
            </Button>
          )}

          {/* Lender: Complete transaction */}
          {isLender && transaction.status === 'BOOK_RETURNED' && (
            <div className="space-y-2">
              <Button
                onClick={handleCompleteTransaction}
                isLoading={completeMutation.isPending}
                className="w-full"
              >
                Complete Transaction (Book Returned in Good Condition)
              </Button>
              <Button variant="danger" onClick={() => navigate(`/disputes/create/${transactionId}`)} className="w-full">
                Report Issue / Raise Dispute
              </Button>
            </div>
          )}

          {/* Completed */}
          {transaction.status === 'COMPLETED' && (
            <>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✅ Transaction completed successfully!
                {isBorrower && ' Thank you for returning the book in good condition.'}
                {isLender && ' The book is now available for rent again.'}
              </div>

              {/* Leave a Review */}
              {canReviewData?.canReview && (
                <Button
                  onClick={() => navigate(`/reviews/create/${transactionId}`)}
                  className="w-full mt-4"
                >
                  ⭐ Leave a Review
                </Button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

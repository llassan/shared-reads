import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  CheckCircle2,
  CreditCard,
  FileWarning,
  Star,
  SearchX,
} from 'lucide-react'
import { transactionsApi } from '../api/transactions'
import { reviewsApi } from '../api/reviews'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { PageTitle } from '../components/common/PageTitle'
import { EmptyState } from '../components/common/EmptyState'
import { StatusBadge } from '../components/common/StatusBadge'
import { formatMoney } from '../lib/format'

const Avatar = ({ photo, name }: { photo?: string | null; name?: string | null }) =>
  photo ? (
    <img src={photo} alt={name || ''} className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
      <span className="text-primary-700 font-semibold">
        {(name || '?')[0].toUpperCase()}
      </span>
    </div>
  )

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
      <PageShell>
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-64 bg-stone-100 rounded-2xl" />
          <div className="h-40 bg-stone-100 rounded-2xl" />
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

  const isBorrower = user?.userId === transaction.borrowerId
  const isLender = user?.userId === transaction.lenderId

  const totalAmount =
    (Number(transaction.depositAmount) || 0) +
    (Number(transaction.rentalAmount) || 0) +
    (Number(transaction.platformFee) || 0)

  const timeline = [
    { label: 'Loan created', at: transaction.createdAt },
    { label: 'Deposit paid', at: transaction.depositPaidAt },
    { label: 'Book handed over', at: transaction.handoverAt },
    { label: 'Book returned', at: transaction.returnedAt },
    { label: 'Loan completed', at: transaction.completedAt },
  ].filter((t) => t.at)

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto">
        <PageTitle
          title="Loan details"
          actions={<StatusBadge status={transaction.status} />}
        />

        {paymentSuccess && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Payment completed successfully! The lender will be notified to arrange the handoff.
          </div>
        )}

        {reviewSuccess && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Review submitted — thank you for keeping the community honest.
          </div>
        )}

        {/* Photo Upload Panel */}
        {showPhotoUpload && (
          <div className="card !border-accent-300/70 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-9 w-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                <Camera className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">
                {uploadType === 'handover' ? 'Confirm handoff' : 'Confirm return'}
              </h3>
            </div>
            <p className="text-sm text-stone-500 mb-4">
              {uploadType === 'handover'
                ? "Take a photo of the book before handing it over — it's the condition evidence for both of you."
                : "Take a photo of the book as you return it — it's the condition evidence for both of you."}
            </p>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="mb-4 text-sm"
            />

            {photoPreview && (
              <div className="mb-4">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handlePhotoSubmit}
                isLoading={handoverMutation.isPending || returnMutation.isPending}
                disabled={!photoFile}
              >
                Confirm {uploadType === 'handover' ? 'handoff' : 'return'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPhotoUpload(false)
                  setPhotoFile(null)
                  setPhotoPreview(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Book */}
          <div className="card">
            <div className="flex gap-5">
              <img
                src={transaction.bookListing.images[0]}
                alt={transaction.bookListing.title}
                className="w-24 h-32 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {transaction.bookListing.title}
                </h2>
                <p className="text-stone-500">by {transaction.bookListing.author}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-500">
                  <span>{transaction.bookListing.rentalDuration} days</span>
                  <span className="capitalize">
                    {transaction.bookListing.condition.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Avatar
                  photo={transaction.borrower.profilePhoto}
                  name={transaction.borrower.name}
                />
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold">
                    Borrower
                  </p>
                  <p className="font-medium text-ink">
                    {transaction.borrower.name || 'Anonymous'}
                    {isBorrower && <span className="text-stone-400 font-normal"> (you)</span>}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-stone-500">
                    <Star className="h-3 w-3 text-accent-500 fill-accent-400" />
                    {transaction.borrower.reputationScore.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar
                  photo={transaction.lender.profilePhoto}
                  name={transaction.lender.name}
                />
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold">
                    Lender
                  </p>
                  <p className="font-medium text-ink">
                    {transaction.lender.name || 'Anonymous'}
                    {isLender && <span className="text-stone-400 font-normal"> (you)</span>}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-stone-500">
                    <Star className="h-3 w-3 text-accent-500 fill-accent-400" />
                    {transaction.lender.reputationScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink">Payment</h3>
              <StatusBadge status={transaction.paymentStatus} />
            </div>
            <dl className="space-y-2.5 text-sm">
              {transaction.depositAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Refundable deposit</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(Number(transaction.depositAmount).toFixed(2))}
                  </dd>
                </div>
              )}
              {transaction.rentalAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Loan fee</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(Number(transaction.rentalAmount).toFixed(2))}
                  </dd>
                </div>
              )}
              {transaction.platformFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone-500">Platform fee</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(Number(transaction.platformFee).toFixed(2))}
                  </dd>
                </div>
              )}
              <div className="border-t border-stone-100 pt-2.5 flex justify-between font-semibold">
                <dt className="text-ink">Total</dt>
                <dd className="text-primary-800">{formatMoney(totalAmount.toFixed(2))}</dd>
              </div>
            </dl>
          </div>

          {/* Evidence Photos */}
          {(transaction.beforeHandoverPhoto || transaction.afterReturnPhoto) && (
            <div className="card">
              <h3 className="font-semibold text-ink mb-4">Condition evidence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.beforeHandoverPhoto && (
                  <div>
                    <p className="text-sm text-stone-500 mb-2">At handoff</p>
                    <img
                      src={transaction.beforeHandoverPhoto}
                      alt="Before handover"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                )}
                {transaction.afterReturnPhoto && (
                  <div>
                    <p className="text-sm text-stone-500 mb-2">At return</p>
                    <img
                      src={transaction.afterReturnPhoto}
                      alt="After return"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-ink mb-4">Reviews</h3>
              <div className="space-y-5">
                {reviews.map((review: any) => (
                  <div key={review.id} className="flex gap-3">
                    <Avatar photo={review.reviewer.profilePhoto} name={review.reviewer.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink">
                          {review.reviewer.name || 'Anonymous'}
                        </p>
                        <span className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={
                                i < review.rating
                                  ? 'h-3.5 w-3.5 text-accent-500 fill-accent-400'
                                  : 'h-3.5 w-3.5 text-stone-200 fill-stone-200'
                              }
                            />
                          ))}
                        </span>
                        <span className="text-xs text-stone-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-sm text-stone-600">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold text-ink mb-4">Timeline</h3>
            <ol className="relative border-l border-stone-200 ml-2 space-y-5">
              {timeline.map((t) => (
                <li key={t.label} className="pl-5 relative">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary-600" />
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(t.at as string).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {isBorrower && transaction.status === 'INITIATED' && transaction.paymentStatus === 'PENDING' && (
            <Button onClick={() => navigate(`/payments/${transactionId}`)} className="w-full">
              <CreditCard className="h-4 w-4" /> Complete payment
            </Button>
          )}

          {isLender && transaction.status === 'DEPOSIT_PAID' && !showPhotoUpload && (
            <Button
              onClick={() => {
                setUploadType('handover')
                setShowPhotoUpload(true)
              }}
              className="w-full"
            >
              <Camera className="h-4 w-4" /> Confirm book handoff
            </Button>
          )}

          {isBorrower && transaction.status === 'BOOK_RECEIVED' && !showPhotoUpload && (
            <Button
              onClick={() => {
                setUploadType('return')
                setShowPhotoUpload(true)
              }}
              className="w-full"
            >
              <Camera className="h-4 w-4" /> Confirm book return
            </Button>
          )}

          {isLender && transaction.status === 'BOOK_RETURNED' && (
            <div className="space-y-2">
              <Button
                onClick={handleCompleteTransaction}
                isLoading={completeMutation.isPending}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4" /> Complete loan — book returned in good condition
              </Button>
              <Button
                variant="danger"
                onClick={() => navigate(`/disputes/create/${transactionId}`)}
                className="w-full"
              >
                <FileWarning className="h-4 w-4" /> Report an issue / raise a dispute
              </Button>
            </div>
          )}

          {transaction.status === 'COMPLETED' && (
            <>
              <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Loan completed successfully!
                {isBorrower && ' Thanks for returning the book in good condition.'}
                {isLender && ' Your book is back on the shelf and available again.'}
              </div>

              {canReviewData?.canReview && (
                <Button
                  onClick={() => navigate(`/reviews/create/${transactionId}`)}
                  className="w-full"
                >
                  <Star className="h-4 w-4" /> Leave a review
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}

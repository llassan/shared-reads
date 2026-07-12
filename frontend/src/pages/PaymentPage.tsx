import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, Star, CheckCircle2, ShieldCheck, SearchX } from 'lucide-react'
import { paymentsApi } from '../api/payments'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { PageShell } from '../components/layout/PageShell'
import { EmptyState } from '../components/common/EmptyState'
import { formatMoney } from '../lib/format'

// Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export const PaymentPage = () => {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['transactionPayment', transactionId],
    queryFn: () => paymentsApi.getTransactionPayment(transactionId!),
    enabled: !!transactionId,
  })

  const createOrderMutation = useMutation({
    mutationFn: () => paymentsApi.createOrder({ transactionId: transactionId! }),
    onSuccess: (data) => {
      setOrderDetails(data)
      setError(null)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create payment order')
    },
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentData: {
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    }) =>
      paymentsApi.verifyPayment({
        transactionId: transactionId!,
        ...paymentData,
      }),
    onSuccess: () => {
      navigate(`/transactions/${transactionId}?payment=success`)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Payment verification failed')
    },
  })

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    if (!orderDetails) {
      createOrderMutation.mutate()
      return
    }

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: orderDetails.order.amount,
      currency: orderDetails.order.currency,
      name: 'SharedReads',
      description: 'Book Rental Payment',
      order_id: orderDetails.order.id,
      handler: (response: RazorpaySuccessResponse) => {
        verifyPaymentMutation.mutate({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        })
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#224334', // primary-800
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-stone-100 rounded w-1/3" />
          <div className="h-96 bg-stone-100 rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  const transaction = paymentData?.transaction

  if (!transaction) {
    return (
      <PageShell>
        <EmptyState
          icon={SearchX}
          title="Transaction not found"
          body="This payment link doesn't match any of your loans."
          action={<Button onClick={() => navigate('/my-requests')}>Back to requests</Button>}
        />
      </PageShell>
    )
  }

  if (transaction.paymentStatus === 'COMPLETED') {
    return (
      <PageShell>
        <EmptyState
          icon={CheckCircle2}
          title="Payment already completed"
          body="This loan has already been paid for — you're all set."
          action={
            <Button onClick={() => navigate(`/transactions/${transactionId}`)}>
              View loan
            </Button>
          }
        />
      </PageShell>
    )
  }

  const totalAmount =
    (Number(transaction.depositAmount) || 0) +
    (Number(transaction.rentalAmount) || 0) +
    (Number(transaction.platformFee) || 0)

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/my-requests')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to requests
        </button>

        <h1 className="font-display text-4xl font-semibold text-primary-950 mb-8">
          Complete payment
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="card !p-7 space-y-6">
          {/* Book */}
          <div className="flex gap-4">
            <img
              src={transaction.bookListing.images[0]}
              alt={transaction.bookListing.title}
              className="w-20 h-28 object-cover rounded-xl shrink-0"
            />
            <div>
              <p className="font-display text-lg font-semibold text-ink">
                {transaction.bookListing.title}
              </p>
              <p className="text-sm text-stone-500">by {transaction.bookListing.author}</p>
              <p className="text-sm text-stone-500 mt-1">
                {transaction.bookListing.rentalDuration}-day loan
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                from {transaction.lender.name || 'Anonymous'}
                <Star className="h-3.5 w-3.5 text-accent-500 fill-accent-400" />
                {transaction.lender.reputationScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t border-stone-100 pt-6">
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
                  <dt className="text-stone-500">Platform fee (15%)</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(Number(transaction.platformFee).toFixed(2))}
                  </dd>
                </div>
              )}
              <div className="border-t border-stone-100 pt-2.5 flex justify-between font-semibold text-base">
                <dt className="text-ink">Total</dt>
                <dd className="text-primary-800">{formatMoney(totalAmount.toFixed(2))}</dd>
              </div>
            </dl>
          </div>

          <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 text-primary-900 px-4 py-3 rounded-xl text-sm">
            <ShieldCheck className="h-4.5 w-4.5 h-[18px] w-[18px] mt-0.5 shrink-0 text-primary-700" />
            Your deposit is fully refunded when the book comes back in good condition.
          </div>

          <Button
            onClick={handlePayment}
            isLoading={createOrderMutation.isPending || verifyPaymentMutation.isPending}
            className="w-full"
          >
            <CreditCard className="h-4 w-4" />
            {orderDetails ? 'Pay now' : 'Continue to payment'}
          </Button>
        </div>
      </div>
    </PageShell>
  )
}

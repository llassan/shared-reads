import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../api/payments'
import { requestsApi } from '../api/requests'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Header } from '../components/layout/Header'

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

  // Fetch transaction payment details
  const { data: paymentData, isLoading } = useQuery({
    queryKey: ['transactionPayment', transactionId],
    queryFn: () => paymentsApi.getTransactionPayment(transactionId!),
    enabled: !!transactionId,
  })

  // Create payment order mutation
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

  // Verify payment mutation
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
      // Redirect to transaction details or success page
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
        // Verify payment on backend
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
        color: '#7C3AED', // primary-600
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  const transaction = paymentData?.transaction

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <Button onClick={() => navigate('/my-requests')}>Back to Requests</Button>
        </div>
      </div>
    )
  }

  // Check if payment is already completed
  if (transaction.paymentStatus === 'COMPLETED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Already Completed</h2>
            <p className="text-gray-600 mb-6">This transaction has already been paid for.</p>
            <Button onClick={() => navigate(`/transactions/${transactionId}`)}>
              View Transaction
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const totalAmount =
    (Number(transaction.depositAmount) || 0) +
    (Number(transaction.rentalAmount) || 0) +
    (Number(transaction.platformFee) || 0)

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="secondary" onClick={() => navigate('/my-requests')}>
            ← Back to Requests
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

          {/* Book Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Book Details</h3>
            <div className="flex gap-4">
              <img
                src={transaction.bookListing.images[0]}
                alt={transaction.bookListing.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium">{transaction.bookListing.title}</p>
                <p className="text-sm text-gray-600">by {transaction.bookListing.author}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {transaction.bookListing.rentalDuration} days
                </p>
              </div>
            </div>
          </div>

          {/* Lender Details */}
          <div className="mb-6">
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
                <p className="font-medium">{transaction.lender.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">
                  ⭐ {transaction.lender.reputationScore.toFixed(1)} rating
                </p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              {transaction.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-medium">${Number(transaction.depositAmount).toFixed(2)}</span>
                </div>
              )}
              {transaction.rentalAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee:</span>
                  <span className="font-medium">${Number(transaction.rentalAmount).toFixed(2)}</span>
                </div>
              )}
              {transaction.platformFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (15%):</span>
                  <span className="font-medium">${Number(transaction.platformFee).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-base">
                <span>Total Amount:</span>
                <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">
              💡 Your security deposit will be refunded after you return the book in good condition.
            </p>
          </div>

          <Button
            onClick={handlePayment}
            isLoading={createOrderMutation.isPending || verifyPaymentMutation.isPending}
            className="w-full"
          >
            {orderDetails ? '💳 Pay Now' : 'Create Payment Order'}
          </Button>
        </Card>
      </main>
    </div>
  )
}

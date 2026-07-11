import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import prisma from '../config/database'
import * as razorpayService from '../services/razorpayService'

/**
 * Create payment order for a transaction
 * POST /api/payments/create-order
 */
export const createPaymentOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId } = req.body

  if (!transactionId) {
    res.status(400).json({ error: 'Transaction ID is required' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is the borrower
  if (transaction.borrowerId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not the borrower for this transaction' })
    return
  }

  // Check if payment already exists
  if (transaction.razorpayOrderId) {
    res.status(400).json({ error: 'Payment order already created for this transaction' })
    return
  }

  // Calculate total amount (deposit + rental + platform fee)
  const totalAmount =
    Number(transaction.depositAmount ?? 0) + Number(transaction.rentalAmount ?? 0) + Number(transaction.platformFee ?? 0)

  // Amount should be in paise (multiply by 100)
  const amountInPaise = Math.round(totalAmount * 100)

  // Create Razorpay order
  const order = await razorpayService.createOrder({
    amount: amountInPaise,
    receipt: `txn_${transaction.id}`,
    notes: {
      transactionId: transaction.id,
      borrowerId: transaction.borrowerId,
      lenderId: transaction.lenderId,
      bookTitle: transaction.bookListing.title,
    },
  })

  // Update transaction with order ID
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      razorpayOrderId: order.id,
    },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  res.status(200).json({
    message: 'Payment order created successfully',
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    transaction: updatedTransaction,
  })
})

/**
 * Verify payment and update transaction status
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  if (!transactionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ error: 'Missing required payment verification parameters' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is the borrower
  if (transaction.borrowerId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not the borrower for this transaction' })
    return
  }

  // Verify order ID matches
  if (transaction.razorpayOrderId !== razorpayOrderId) {
    res.status(400).json({ error: 'Order ID mismatch' })
    return
  }

  // Verify payment signature
  const isValid = razorpayService.verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  })

  if (!isValid) {
    res.status(400).json({ error: 'Invalid payment signature' })
    return
  }

  // Update transaction with payment details
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      razorpayPaymentId,
      paymentStatus: 'COMPLETED',
      depositPaidAt: new Date(),
      status: 'DEPOSIT_PAID',
    },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  // Update book listing availability
  await prisma.bookListing.update({
    where: { id: transaction.bookListingId },
    data: { available: false },
  })

  res.status(200).json({
    message: 'Payment verified successfully',
    transaction: updatedTransaction,
  })
})

/**
 * Get payment details for a transaction
 * GET /api/payments/transaction/:transactionId
 */
export const getTransactionPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId } = req.params

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is involved in the transaction
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not part of this transaction' })
    return
  }

  // If payment exists, fetch details from Razorpay
  let paymentDetails = null
  if (transaction.razorpayPaymentId) {
    try {
      paymentDetails = await razorpayService.fetchPayment(transaction.razorpayPaymentId)
    } catch (error) {
      console.error('Failed to fetch payment details:', error)
    }
  }

  res.status(200).json({
    transaction,
    paymentDetails,
  })
})

/**
 * Initiate refund for a transaction
 * POST /api/payments/refund
 */
export const initiateRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { transactionId, reason } = req.body

  if (!transactionId || !reason) {
    res.status(400).json({ error: 'Transaction ID and reason are required' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      borrower: true,
      lender: true,
    },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Check if payment was made
  if (!transaction.razorpayPaymentId || transaction.paymentStatus !== 'COMPLETED') {
    res.status(400).json({ error: 'No completed payment found for this transaction' })
    return
  }

  // Check if already refunded
  if (transaction.refundStatus === 'COMPLETED') {
    res.status(400).json({ error: 'Refund already processed for this transaction' })
    return
  }

  // Initiate refund
  const refund = await razorpayService.initiateRefund(transaction.razorpayPaymentId)

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      refundStatus: 'INITIATED',
      refundInitiatedAt: new Date(),
      refundReason: reason,
    },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  res.status(200).json({
    message: 'Refund initiated successfully',
    transaction: updatedTransaction,
    refund,
  })
})

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import prisma from '../config/database'
import * as cloudinaryService from '../services/cloudinaryService'

/**
 * Get transaction by ID
 * GET /api/v1/transactions/:id
 */
export const getTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      borrower: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          reputationScore: true,
          profilePhoto: true,
        },
      },
      lender: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          reputationScore: true,
          profilePhoto: true,
        },
      },
      bookListing: {
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          images: true,
          condition: true,
          rentalType: true,
          rentalPrice: true,
          depositAmount: true,
          rentalDuration: true,
        },
      },
    },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is part of this transaction
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not part of this transaction' })
    return
  }

  res.json({
    success: true,
    data: { transaction },
  })
})

/**
 * Confirm book handover (lender uploads photo)
 * POST /api/v1/transactions/:id/handover
 */
export const confirmHandover = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params
  const { photoBase64 } = req.body

  if (!photoBase64) {
    res.status(400).json({ error: 'Photo is required for handover confirmation' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      borrower: true,
      lender: true,
    },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is the lender
  if (transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: Only the lender can confirm handover' })
    return
  }

  // Verify payment is completed
  if (transaction.paymentStatus !== 'COMPLETED') {
    res.status(400).json({ error: 'Payment must be completed before handover' })
    return
  }

  // Verify transaction is in DEPOSIT_PAID status
  if (transaction.status !== 'DEPOSIT_PAID') {
    res.status(400).json({ error: 'Transaction must be in DEPOSIT_PAID status for handover' })
    return
  }

  // Upload photo to Cloudinary
  let photoUrl: string
  try {
    const uploadResult = await cloudinaryService.uploadImage(photoBase64, 'transaction-evidence')
    photoUrl = uploadResult.secureUrl
  } catch (error) {
    console.error('Failed to upload handover photo:', error)
    res.status(500).json({ error: 'Failed to upload photo' })
    return
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      beforeHandoverPhoto: photoUrl,
      handoverAt: new Date(),
      status: 'BOOK_RECEIVED',
    },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  res.json({
    success: true,
    message: 'Book handover confirmed successfully',
    data: { transaction: updatedTransaction },
  })
})

/**
 * Confirm book return (borrower uploads photo)
 * POST /api/v1/transactions/:id/return
 */
export const confirmReturn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params
  const { photoBase64 } = req.body

  if (!photoBase64) {
    res.status(400).json({ error: 'Photo is required for return confirmation' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id },
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
    res.status(403).json({ error: 'Unauthorized: Only the borrower can confirm return' })
    return
  }

  // Verify transaction is in BOOK_RECEIVED status
  if (transaction.status !== 'BOOK_RECEIVED') {
    res.status(400).json({ error: 'Transaction must be in BOOK_RECEIVED status for return' })
    return
  }

  // Upload photo to Cloudinary
  let photoUrl: string
  try {
    const uploadResult = await cloudinaryService.uploadImage(photoBase64, 'transaction-evidence')
    photoUrl = uploadResult.secureUrl
  } catch (error) {
    console.error('Failed to upload return photo:', error)
    res.status(500).json({ error: 'Failed to upload photo' })
    return
  }

  // Update transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      afterReturnPhoto: photoUrl,
      returnedAt: new Date(),
      status: 'BOOK_RETURNED',
    },
    include: {
      borrower: true,
      lender: true,
      bookListing: true,
    },
  })

  res.json({
    success: true,
    message: 'Book return confirmed successfully',
    data: { transaction: updatedTransaction },
  })
})

/**
 * Complete transaction (lender confirms return is acceptable)
 * POST /api/v1/transactions/:id/complete
 */
export const completeTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id },
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

  // Verify user is the lender
  if (transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: Only the lender can complete the transaction' })
    return
  }

  // Verify transaction is in BOOK_RETURNED status
  if (transaction.status !== 'BOOK_RETURNED') {
    res.status(400).json({ error: 'Transaction must be in BOOK_RETURNED status to complete' })
    return
  }

  // Update transaction and book availability
  const [updatedTransaction] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        borrower: true,
        lender: true,
        bookListing: true,
      },
    }),
    // Make book available again
    prisma.bookListing.update({
      where: { id: transaction.bookListingId },
      data: { available: true },
    }),
  ])

  res.json({
    success: true,
    message: 'Transaction completed successfully. Book is now available for rent again.',
    data: { transaction: updatedTransaction },
  })
})

/**
 * Get all transactions for current user
 * GET /api/v1/transactions
 */
export const getMyTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ borrowerId: userId }, { lenderId: userId }],
    },
    include: {
      borrower: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
          profilePhoto: true,
        },
      },
      lender: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
          profilePhoto: true,
        },
      },
      bookListing: {
        select: {
          id: true,
          title: true,
          author: true,
          images: true,
          condition: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({
    success: true,
    data: { transactions, total: transactions.length },
  })
})

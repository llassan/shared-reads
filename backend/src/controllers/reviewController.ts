import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import prisma from '../config/database'

/**
 * Create a review for a completed transaction
 * POST /api/v1/reviews
 */
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId, rating, comment } = req.body

  // Validation
  if (!transactionId || !rating) {
    res.status(400).json({ error: 'Transaction ID and rating are required' })
    return
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' })
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

  // Verify user is part of this transaction
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not part of this transaction' })
    return
  }

  // Verify transaction is completed
  if (transaction.status !== 'COMPLETED') {
    res.status(400).json({ error: 'Transaction must be completed before leaving a review' })
    return
  }

  // Determine reviewee (the other party)
  const revieweeId = transaction.borrowerId === userId ? transaction.lenderId : transaction.borrowerId

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: {
      reviewerId_transactionId: {
        reviewerId: userId,
        transactionId,
      },
    },
  })

  if (existingReview) {
    res.status(400).json({ error: 'You have already reviewed this transaction' })
    return
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      reviewerId: userId,
      revieweeId,
      transactionId,
      rating,
      comment: comment || null,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Recalculate reviewee's reputation score
  await updateUserReputationScore(revieweeId)

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review },
  })
})

/**
 * Get reviews for a specific user (as reviewee)
 * GET /api/v1/reviews/user/:userId
 */
export const getUserReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params
  const { page = 1, limit = 10 } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            reputationScore: true,
          },
        },
        transaction: {
          select: {
            id: true,
            bookListing: {
              select: {
                title: true,
                author: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.review.count({
      where: { revieweeId: userId },
    }),
  ])

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  })
})

/**
 * Get review for a specific transaction
 * GET /api/v1/reviews/transaction/:transactionId
 */
export const getTransactionReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { transactionId } = req.params

  const reviews = await prisma.review.findMany({
    where: { transactionId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      reviewee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  res.json({
    success: true,
    data: { reviews },
  })
})

/**
 * Check if current user can review a transaction
 * GET /api/v1/reviews/can-review/:transactionId
 */
export const canReviewTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId } = req.params

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  })

  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' })
    return
  }

  // Verify user is part of this transaction
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) {
    res.json({
      success: true,
      data: { canReview: false, reason: 'Not part of this transaction' },
    })
    return
  }

  // Verify transaction is completed
  if (transaction.status !== 'COMPLETED') {
    res.json({
      success: true,
      data: { canReview: false, reason: 'Transaction not completed' },
    })
    return
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: {
      reviewerId_transactionId: {
        reviewerId: userId,
        transactionId,
      },
    },
  })

  if (existingReview) {
    res.json({
      success: true,
      data: { canReview: false, reason: 'Already reviewed' },
    })
    return
  }

  res.json({
    success: true,
    data: { canReview: true },
  })
})

/**
 * Helper function to recalculate user reputation score
 */
async function updateUserReputationScore(userId: string): Promise<void> {
  // Get all reviews for this user
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    select: { rating: true },
  })

  if (reviews.length === 0) {
    // No reviews yet, keep default score
    return
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length

  // Update user's reputation score
  await prisma.user.update({
    where: { id: userId },
    data: { reputationScore: averageRating },
  })
}

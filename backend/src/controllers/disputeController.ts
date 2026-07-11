import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import prisma from '../config/database'
import * as cloudinaryService from '../services/cloudinaryService'

/**
 * Create a dispute for a transaction
 * POST /api/v1/disputes
 */
export const createDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { transactionId, reason, description, evidencePhotos } = req.body

  // Validation
  if (!transactionId || !reason || !description) {
    res.status(400).json({ error: 'Transaction ID, reason, and description are required' })
    return
  }

  // Fetch transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      borrower: true,
      lender: true,
      dispute: true,
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

  // Verify transaction is in BOOK_RETURNED status (disputes can only be raised after return)
  if (transaction.status !== 'BOOK_RETURNED') {
    res.status(400).json({ error: 'Disputes can only be raised after the book is returned' })
    return
  }

  // Check if dispute already exists
  if (transaction.dispute) {
    res.status(400).json({ error: 'A dispute already exists for this transaction' })
    return
  }

  // Upload evidence photos if provided
  let uploadedPhotos: string[] = []
  if (evidencePhotos && Array.isArray(evidencePhotos)) {
    try {
      const uploadPromises = evidencePhotos.map((photo: string) =>
        cloudinaryService.uploadImage(photo, 'dispute-evidence')
      )
      const results = await Promise.all(uploadPromises)
      uploadedPhotos = results.map((result) => result.secureUrl)
    } catch (error) {
      console.error('Failed to upload evidence photos:', error)
      res.status(500).json({ error: 'Failed to upload evidence photos' })
      return
    }
  }

  // Create dispute
  const dispute = await prisma.dispute.create({
    data: {
      transactionId,
      raisedById: userId,
      reason,
      description,
      evidencePhotos: uploadedPhotos,
    },
    include: {
      raisedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transaction: {
        include: {
          borrower: true,
          lender: true,
          bookListing: true,
        },
      },
    },
  })

  // Update transaction status to DISPUTED
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'DISPUTED' },
  })

  res.status(201).json({
    success: true,
    message: 'Dispute created successfully. An admin will review your case.',
    data: { dispute },
  })
})

/**
 * Add counter-evidence to a dispute
 * POST /api/v1/disputes/:id/counter-evidence
 */
export const addCounterEvidence = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params
  const { counterDescription, counterEvidence } = req.body

  if (!counterDescription) {
    res.status(400).json({ error: 'Counter description is required' })
    return
  }

  // Fetch dispute
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      transaction: true,
    },
  })

  if (!dispute) {
    res.status(404).json({ error: 'Dispute not found' })
    return
  }

  // Verify user is the other party (not the one who raised the dispute)
  const transaction = dispute.transaction
  const isOtherParty =
    (transaction.borrowerId === userId || transaction.lenderId === userId) &&
    userId !== dispute.raisedById

  if (!isOtherParty) {
    res.status(403).json({ error: 'Unauthorized: You cannot add counter-evidence to this dispute' })
    return
  }

  // Check if counter-evidence already exists
  if (dispute.counterDescription) {
    res.status(400).json({ error: 'Counter-evidence already submitted' })
    return
  }

  // Upload counter-evidence photos if provided
  let uploadedPhotos: string[] = []
  if (counterEvidence && Array.isArray(counterEvidence)) {
    try {
      const uploadPromises = counterEvidence.map((photo: string) =>
        cloudinaryService.uploadImage(photo, 'dispute-counter-evidence')
      )
      const results = await Promise.all(uploadPromises)
      uploadedPhotos = results.map((result) => result.secureUrl)
    } catch (error) {
      console.error('Failed to upload counter-evidence photos:', error)
      res.status(500).json({ error: 'Failed to upload counter-evidence photos' })
      return
    }
  }

  // Update dispute with counter-evidence
  const updatedDispute = await prisma.dispute.update({
    where: { id },
    data: {
      counterDescription,
      counterEvidence: uploadedPhotos,
    },
    include: {
      raisedBy: true,
      transaction: {
        include: {
          borrower: true,
          lender: true,
          bookListing: true,
        },
      },
    },
  })

  res.json({
    success: true,
    message: 'Counter-evidence submitted successfully',
    data: { dispute: updatedDispute },
  })
})

/**
 * Get dispute by ID
 * GET /api/v1/disputes/:id
 */
export const getDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { id } = req.params

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      raisedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      transaction: {
        include: {
          borrower: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              reputationScore: true,
            },
          },
          lender: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              reputationScore: true,
            },
          },
          bookListing: {
            select: {
              id: true,
              title: true,
              author: true,
              images: true,
              depositAmount: true,
            },
          },
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!dispute) {
    res.status(404).json({ error: 'Dispute not found' })
    return
  }

  // Verify user is part of this dispute
  const transaction = dispute.transaction
  if (transaction.borrowerId !== userId && transaction.lenderId !== userId) {
    res.status(403).json({ error: 'Unauthorized: You are not part of this dispute' })
    return
  }

  res.json({
    success: true,
    data: { dispute },
  })
})

/**
 * Get all disputes for current user
 * GET /api/v1/disputes/my-disputes
 */
export const getMyDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId

  const disputes = await prisma.dispute.findMany({
    where: {
      transaction: {
        OR: [{ borrowerId: userId }, { lenderId: userId }],
      },
    },
    include: {
      raisedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      transaction: {
        include: {
          bookListing: {
            select: {
              title: true,
              author: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({
    success: true,
    data: { disputes, total: disputes.length },
  })
})

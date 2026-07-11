import { Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { asyncHandler } from '../middleware/asyncHandler'
import prisma from '../config/database'
import { config } from '../config/env'

// Admin authentication middleware
export interface AdminRequest extends Request {
  admin?: {
    adminId: string
    email: string
    role: string
  }
}

/**
 * Admin login
 * POST /api/v1/admin/login
 */
export const adminLogin = asyncHandler(async (req: any, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email },
  })

  if (!admin) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  // Generate JWT token
  const token = jwt.sign(
    { adminId: admin.id, email: admin.email, role: admin.role },
    config.jwt.accessSecret,
    { expiresIn: '8h' }
  )

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  res.json({
    success: true,
    data: {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token,
    },
  })
})

/**
 * Get platform statistics
 * GET /api/v1/admin/stats
 */
export const getPlatformStats = asyncHandler(async (_req: any, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    totalBooks,
    availableBooks,
    totalTransactions,
    completedTransactions,
    totalDisputes,
    pendingDisputes,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
    prisma.bookListing.count(),
    prisma.bookListing.count({ where: { available: true } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.dispute.count(),
    prisma.dispute.count({ where: { status: 'PENDING' } }),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { platformFee: true },
    }),
  ])

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: totalUsers - activeUsers,
      },
      books: {
        total: totalBooks,
        available: availableBooks,
        borrowed: totalBooks - availableBooks,
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        inProgress: totalTransactions - completedTransactions,
      },
      disputes: {
        total: totalDisputes,
        pending: pendingDisputes,
        resolved: totalDisputes - pendingDisputes,
      },
      revenue: {
        total: Number(totalRevenue._sum.platformFee || 0),
      },
    },
  })
})

/**
 * Get all pending disputes
 * GET /api/v1/admin/disputes/pending
 */
export const getPendingDisputes = asyncHandler(async (_req: any, res: Response) => {
  const disputes = await prisma.dispute.findMany({
    where: { status: 'PENDING' },
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
          borrower: {
            select: {
              id: true,
              name: true,
              email: true,
              reputationScore: true,
            },
          },
          lender: {
            select: {
              id: true,
              name: true,
              email: true,
              reputationScore: true,
            },
          },
          bookListing: {
            select: {
              title: true,
              author: true,
              images: true,
              depositAmount: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  res.json({
    success: true,
    data: { disputes, total: disputes.length },
  })
})

/**
 * Resolve a dispute
 * POST /api/v1/admin/disputes/:id/resolve
 */
export const resolveDispute = asyncHandler(async (req: any, res: Response) => {
  const adminId = req.admin!.adminId
  const { id } = req.params
  const { resolutionOutcome, resolutionNotes } = req.body

  if (!resolutionOutcome) {
    res.status(400).json({ error: 'Resolution outcome is required' })
    return
  }

  // Validate resolution outcome
  const validOutcomes = ['REFUND_TO_BORROWER', 'KEEP_WITH_LENDER', 'SPLIT_50_50']
  if (!validOutcomes.includes(resolutionOutcome)) {
    res.status(400).json({ error: 'Invalid resolution outcome' })
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

  if (dispute.status !== 'PENDING') {
    res.status(400).json({ error: 'Dispute has already been resolved' })
    return
  }

  // Update dispute
  const updatedDispute = await prisma.dispute.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolutionOutcome,
      resolutionNotes: resolutionNotes || null,
      adminId,
      resolvedAt: new Date(),
    },
    include: {
      transaction: {
        include: {
          borrower: true,
          lender: true,
          bookListing: true,
        },
      },
    },
  })

  // Complete the transaction
  await prisma.transaction.update({
    where: { id: dispute.transactionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })

  // Make book available again
  await prisma.bookListing.update({
    where: { id: updatedDispute.transaction.bookListingId },
    data: { available: true },
  })

  res.json({
    success: true,
    message: `Dispute resolved: ${resolutionOutcome}`,
    data: { dispute: updatedDispute },
  })
})

/**
 * Get all users with pagination
 * GET /api/v1/admin/users
 */
export const getAllUsers = asyncHandler(async (req: any, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  const where: any = {}
  if (status) {
    where.accountStatus = status
  }
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { name: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        emailVerified: true,
        phoneVerified: true,
        reputationScore: true,
        accountStatus: true,
        suspendedReason: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ])

  res.json({
    success: true,
    data: {
      users,
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
 * Suspend a user
 * POST /api/v1/admin/users/:id/suspend
 */
export const suspendUser = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params
  const { reason } = req.body

  if (!reason) {
    res.status(400).json({ error: 'Suspension reason is required' })
    return
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: 'SUSPENDED',
      suspendedReason: reason,
    },
  })

  res.json({
    success: true,
    message: 'User suspended successfully',
    data: { user },
  })
})

/**
 * Activate a user
 * POST /api/v1/admin/users/:id/activate
 */
export const activateUser = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params

  const user = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: 'ACTIVE',
      suspendedReason: null,
    },
  })

  res.json({
    success: true,
    message: 'User activated successfully',
    data: { user },
  })
})

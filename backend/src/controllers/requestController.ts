import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import {
  createBorrowRequestSchema,
  rejectBorrowRequestSchema,
} from '../utils/validationSchemas';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors';

/**
 * Create a borrow request
 * POST /api/v1/requests
 */
export const createBorrowRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const validatedData = createBorrowRequestSchema.parse(req.body);

    // Get book listing
    const bookListing = await prisma.bookListing.findUnique({
      where: { id: validatedData.bookListingId },
      include: { lender: true },
    });

    if (!bookListing) {
      throw new NotFoundError('Book listing not found');
    }

    // Validate book is available
    if (!bookListing.available) {
      throw new ValidationError('This book is currently unavailable');
    }

    // Prevent self-borrowing
    if (bookListing.lenderId === userId) {
      throw new ValidationError('You cannot borrow your own book');
    }

    // Check for existing pending request
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        borrowerId: userId,
        bookListingId: validatedData.bookListingId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new ConflictError('You already have a pending request for this book');
    }

    // Create borrow request
    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        borrowerId: userId,
        lenderId: bookListing.lenderId,
        bookListingId: validatedData.bookListingId,
      },
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
          },
        },
        bookListing: {
          select: {
            id: true,
            title: true,
            author: true,
            images: true,
            rentalType: true,
            rentalPrice: true,
            depositAmount: true,
            rentalDuration: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Borrow request sent successfully',
      data: { borrowRequest },
    });
  }
);

/**
 * Get all borrow requests for current user (as borrower)
 * GET /api/v1/requests/my-requests
 */
export const getMyRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const requests = await prisma.borrowRequest.findMany({
      where: { borrowerId: userId },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            reputationScore: true,
          },
        },
        bookListing: {
          select: {
            id: true,
            title: true,
            author: true,
            images: true,
            rentalType: true,
            rentalPrice: true,
            depositAmount: true,
            rentalDuration: true,
            condition: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            depositPaidAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { requests, total: requests.length },
    });
  }
);

/**
 * Get all incoming borrow requests for current user (as lender)
 * GET /api/v1/requests/incoming
 */
export const getIncomingRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const requests = await prisma.borrowRequest.findMany({
      where: { lenderId: userId },
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
        bookListing: {
          select: {
            id: true,
            title: true,
            author: true,
            images: true,
            rentalType: true,
            rentalPrice: true,
            depositAmount: true,
            rentalDuration: true,
            condition: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            depositPaidAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { requests, total: requests.length },
    });
  }
);

/**
 * Get single borrow request
 * GET /api/v1/requests/:id
 */
export const getBorrowRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const borrowRequest = await prisma.borrowRequest.findUnique({
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
            location: true,
          },
        },
      },
    });

    if (!borrowRequest) {
      throw new NotFoundError('Borrow request not found');
    }

    // Verify user is either borrower or lender
    if (
      borrowRequest.borrowerId !== userId &&
      borrowRequest.lenderId !== userId
    ) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      success: true,
      data: { borrowRequest },
    });
  }
);

/**
 * Approve a borrow request
 * POST /api/v1/requests/:id/approve
 */
export const approveBorrowRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: { bookListing: true },
    });

    if (!borrowRequest) {
      throw new NotFoundError('Borrow request not found');
    }

    // Verify user is the lender
    if (borrowRequest.lenderId !== userId) {
      throw new ForbiddenError('Only the lender can approve this request');
    }

    // Verify request is pending
    if (borrowRequest.status !== 'PENDING') {
      throw new ValidationError('This request has already been processed');
    }

    // Approve request and create transaction
    const [updatedRequest, transaction] = await prisma.$transaction([
      prisma.borrowRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
        include: {
          borrower: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          bookListing: true,
        },
      }),
      prisma.transaction.create({
        data: {
          borrowerId: borrowRequest.borrowerId,
          lenderId: borrowRequest.lenderId,
          bookListingId: borrowRequest.bookListingId,
          borrowRequestId: borrowRequest.id,
          depositAmount: borrowRequest.bookListing.depositAmount || 0,
          rentalAmount: borrowRequest.bookListing.rentalPrice || 0,
          platformFee:
            borrowRequest.bookListing.rentalPrice
              ? Number(borrowRequest.bookListing.rentalPrice) * 0.15
              : 0,
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Borrow request approved. Transaction created.',
      data: {
        borrowRequest: updatedRequest,
        transaction,
      },
    });
  }
);

/**
 * Reject a borrow request
 * POST /api/v1/requests/:id/reject
 */
export const rejectBorrowRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const validatedData = rejectBorrowRequestSchema.parse(req.body);

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
    });

    if (!borrowRequest) {
      throw new NotFoundError('Borrow request not found');
    }

    // Verify user is the lender
    if (borrowRequest.lenderId !== userId) {
      throw new ForbiddenError('Only the lender can reject this request');
    }

    // Verify request is pending
    if (borrowRequest.status !== 'PENDING') {
      throw new ValidationError('This request has already been processed');
    }

    // Reject request
    const updatedRequest = await prisma.borrowRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: validatedData.rejectionReason,
      },
    });

    res.json({
      success: true,
      message: 'Borrow request rejected',
      data: { borrowRequest: updatedRequest },
    });
  }
);

/**
 * Cancel a borrow request (by borrower)
 * DELETE /api/v1/requests/:id
 */
export const cancelBorrowRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
    });

    if (!borrowRequest) {
      throw new NotFoundError('Borrow request not found');
    }

    // Verify user is the borrower
    if (borrowRequest.borrowerId !== userId) {
      throw new ForbiddenError('Only the borrower can cancel this request');
    }

    // Verify request is pending
    if (borrowRequest.status !== 'PENDING') {
      throw new ValidationError(
        'Can only cancel pending requests'
      );
    }

    // Cancel request
    const updatedRequest = await prisma.borrowRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Borrow request cancelled',
      data: { borrowRequest: updatedRequest },
    });
  }
);

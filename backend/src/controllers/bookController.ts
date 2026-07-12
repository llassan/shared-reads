import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { createBookListingSchema } from '../utils/validationSchemas';
import {
  uploadMultipleImages,
  deleteMultipleImages,
  extractPublicId,
} from '../services/storageService';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';

/**
 * Create a new book listing
 * POST /api/v1/books
 */
export const createBookListing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    // Parse form data
    const validatedData = createBookListingSchema.parse({
      ...req.body,
      // Convert string numbers to actual numbers
      rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : undefined,
      depositAmount: req.body.depositAmount ? parseFloat(req.body.depositAmount) : undefined,
      rentalDuration: parseInt(req.body.rentalDuration, 10),
      location: JSON.parse(req.body.location),
    });

    // Validate rental type requirements
    if (validatedData.rentalType === 'PAID') {
      if (!validatedData.rentalPrice || validatedData.rentalPrice <= 0) {
        throw new ValidationError('Rental price is required for paid rentals');
      }
      if (!validatedData.depositAmount || validatedData.depositAmount <= 0) {
        throw new ValidationError('Deposit amount is required for paid rentals');
      }
    }

    // Handle image uploads
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      throw new ValidationError('Minimum 2 images required');
    }
    if (files.length > 5) {
      throw new ValidationError('Maximum 5 images allowed');
    }

    // Upload images to Cloudinary
    let imageUrls: string[] = [];
    try {
      const imageBuffers = files.map((file) => file.buffer);
      imageUrls = await uploadMultipleImages(imageBuffers, 'book-listings');
    } catch (error) {
      // In development, use placeholder images if Cloudinary is not configured
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Cloudinary not configured - using placeholder images');
        imageUrls = files.map(
          (_, i) => `https://via.placeholder.com/800x600?text=Book+Image+${i + 1}`
        );
      } else {
        throw error;
      }
    }

    // Create book listing
    const bookListing = await prisma.bookListing.create({
      data: {
        title: validatedData.title,
        author: validatedData.author,
        description: validatedData.description,
        condition: validatedData.condition,
        rentalType: validatedData.rentalType,
        rentalPrice: validatedData.rentalPrice,
        depositAmount: validatedData.depositAmount,
        rentalDuration: validatedData.rentalDuration,
        images: imageUrls,
        location: validatedData.location,
        lenderId: userId,
      },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            reputationScore: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Book listed successfully',
      data: { bookListing },
    });
  }
);

/**
 * Get all book listings for current user
 * GET /api/v1/books/my-listings
 */
export const getMyListings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const listings = await prisma.bookListing.findMany({
      where: { lenderId: userId },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            reputationScore: true,
            profilePhoto: true,
          },
        },
        borrowRequests: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { listings, total: listings.length },
    });
  }
);

/**
 * Get single book listing by ID
 * GET /api/v1/books/:id
 */
export const getBookListing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const bookListing = await prisma.bookListing.findUnique({
      where: { id },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            reputationScore: true,
            profilePhoto: true,
            createdAt: true,
          },
        },
      },
    });

    if (!bookListing) {
      throw new NotFoundError('Book listing not found');
    }

    res.json({
      success: true,
      data: { bookListing },
    });
  }
);

/**
 * Update book listing
 * PUT /api/v1/books/:id
 */
export const updateBookListing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.bookListing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      throw new NotFoundError('Book listing not found');
    }

    if (existingListing.lenderId !== userId) {
      throw new ForbiddenError('You can only update your own listings');
    }

    // Parse and validate data
    const validatedData = createBookListingSchema.partial().parse({
      ...req.body,
      rentalPrice: req.body.rentalPrice ? parseFloat(req.body.rentalPrice) : undefined,
      depositAmount: req.body.depositAmount ? parseFloat(req.body.depositAmount) : undefined,
      rentalDuration: req.body.rentalDuration ? parseInt(req.body.rentalDuration, 10) : undefined,
      location: req.body.location ? JSON.parse(req.body.location) : undefined,
    });

    // Handle new image uploads if provided
    let imageUrls = existingListing.images;
    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > 0) {
      if (files.length < 2 || files.length > 5) {
        throw new ValidationError('Provide between 2 and 5 images');
      }

      try {
        // Delete old images
        const oldPublicIds = existingListing.images
          .map(extractPublicId)
          .filter((id): id is string => id !== null);
        if (oldPublicIds.length > 0) {
          await deleteMultipleImages(oldPublicIds);
        }

        // Upload new images
        const imageBuffers = files.map((file) => file.buffer);
        imageUrls = await uploadMultipleImages(imageBuffers, 'book-listings');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️  Image update skipped - Cloudinary not configured');
        } else {
          throw error;
        }
      }
    }

    // Update listing
    const updatedListing = await prisma.bookListing.update({
      where: { id },
      data: {
        ...validatedData,
        images: imageUrls,
      },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            reputationScore: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Book listing updated successfully',
      data: { bookListing: updatedListing },
    });
  }
);

/**
 * Delete book listing
 * DELETE /api/v1/books/:id
 */
export const deleteBookListing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.bookListing.findUnique({
      where: { id },
      include: {
        borrowRequests: {
          where: { status: 'PENDING' },
        },
      },
    });

    if (!existingListing) {
      throw new NotFoundError('Book listing not found');
    }

    if (existingListing.lenderId !== userId) {
      throw new ForbiddenError('You can only delete your own listings');
    }

    // Prevent deletion if there are pending borrow requests
    if (existingListing.borrowRequests.length > 0) {
      throw new ValidationError(
        'Cannot delete listing with pending borrow requests'
      );
    }

    // Delete images from Cloudinary
    try {
      const publicIds = existingListing.images
        .map(extractPublicId)
        .filter((id): id is string => id !== null);
      if (publicIds.length > 0) {
        await deleteMultipleImages(publicIds);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Image deletion skipped - Cloudinary not configured');
      } else {
        // Don't fail deletion if image cleanup fails
        console.error('Failed to delete images:', error);
      }
    }

    // Delete listing
    await prisma.bookListing.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Book listing deleted successfully',
    });
  }
);

/**
 * Toggle book availability
 * PATCH /api/v1/books/:id/availability
 */
export const toggleAvailability = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { available } = req.body;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.bookListing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      throw new NotFoundError('Book listing not found');
    }

    if (existingListing.lenderId !== userId) {
      throw new ForbiddenError('You can only update your own listings');
    }

    // Update availability
    const updatedListing = await prisma.bookListing.update({
      where: { id },
      data: { available: available ?? !existingListing.available },
      select: {
        id: true,
        title: true,
        available: true,
      },
    });

    res.json({
      success: true,
      message: `Book listing ${updatedListing.available ? 'enabled' : 'disabled'}`,
      data: { bookListing: updatedListing },
    });
  }
);

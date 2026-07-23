import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { searchBooksSchema } from '../utils/validationSchemas';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for books based on location and filters
 * GET /api/v1/search
 */
export const searchBooks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData = searchBooksSchema.parse({
      query: req.query.query,
      latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
      longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
      radius: req.query.radius ? parseFloat(req.query.radius as string) : 5,
      rentalType: req.query.rentalType,
      condition: req.query.condition,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });

    // Build where clause
    const where: any = {
      available: true,
    };

    // Text search (title or author)
    if (validatedData.query) {
      where.OR = [
        { title: { contains: validatedData.query, mode: 'insensitive' } },
        { author: { contains: validatedData.query, mode: 'insensitive' } },
      ];
    }

    // Filter by rental type
    if (validatedData.rentalType) {
      where.rentalType = validatedData.rentalType;
    }

    // Filter by condition
    if (validatedData.condition) {
      where.condition = validatedData.condition;
    }

    // Filter by price range (only for PAID rentals)
    if (validatedData.minPrice !== undefined || validatedData.maxPrice !== undefined) {
      where.rentalType = 'PAID';
      where.rentalPrice = {};

      if (validatedData.minPrice !== undefined) {
        where.rentalPrice.gte = validatedData.minPrice;
      }
      if (validatedData.maxPrice !== undefined) {
        where.rentalPrice.lte = validatedData.maxPrice;
      }
    }

    // Get all matching books
    const allBooks = await prisma.bookListing.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    // Distance is only meaningful when the caller shared a location
    const hasLocation =
      validatedData.latitude !== undefined && validatedData.longitude !== undefined;

    let booksWithDistance = allBooks.map((book) => {
      const bookLocation = book.location as any;
      const distance = hasLocation
        ? parseFloat(
            calculateDistance(
              validatedData.latitude!,
              validatedData.longitude!,
              bookLocation.lat,
              bookLocation.lng
            ).toFixed(2)
          )
        : null;

      return {
        ...book,
        distance,
      };
    });

    if (hasLocation) {
      // radius 0 means "anywhere" — keep distances but skip the cutoff
      if (validatedData.radius > 0) {
        booksWithDistance = booksWithDistance.filter(
          (book) => book.distance! <= validatedData.radius
        );
      }
      booksWithDistance.sort((a, b) => a.distance! - b.distance!);
    }

    // Paginate results
    const total = booksWithDistance.length;
    const skip = (validatedData.page - 1) * validatedData.limit;
    const paginatedBooks = booksWithDistance.slice(
      skip,
      skip + validatedData.limit
    );

    res.json({
      success: true,
      data: {
        books: paginatedBooks,
        total,
        page: validatedData.page,
        limit: validatedData.limit,
        totalPages: Math.ceil(total / validatedData.limit),
      },
    });
  }
);

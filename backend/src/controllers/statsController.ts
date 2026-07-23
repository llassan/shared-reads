import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import prisma from '../config/database';

/**
 * Public platform stats for the landing page (social proof).
 * Unauthenticated and cheap: counts + latest listings, cached in-memory
 * for 60s so scanner/bot traffic never turns into database load.
 */

interface PublicStats {
  totalBooks: number;
  totalReaders: number;
  exchangedThisMonth: number;
  recentBooks: {
    id: string;
    title: string;
    author: string;
    images: string[];
    rentalType: string;
    rentalPrice: unknown;
    createdAt: Date;
  }[];
}

let cache: { data: PublicStats; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export const getPublicStats = asyncHandler(async (_req: Request, res: Response) => {
  if (cache && cache.expiresAt > Date.now()) {
    res.json({ success: true, data: cache.data });
    return;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalBooks, totalReaders, exchangedThisMonth, recentBooks] = await Promise.all([
    prisma.bookListing.count({ where: { available: true } }),
    prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
    prisma.transaction.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.bookListing.findMany({
      where: { available: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        author: true,
        images: true,
        rentalType: true,
        rentalPrice: true,
        createdAt: true,
      },
    }),
  ]);

  const data: PublicStats = { totalBooks, totalReaders, exchangedThisMonth, recentBooks };
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };

  res.json({ success: true, data });
});

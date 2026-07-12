import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in international E.164 format, e.g. +14155551234')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  emailOtp: z.string().length(6, 'Email OTP must be 6 digits'),
  phoneOtp: z.string().length(6, 'Phone OTP must be 6 digits').optional(),
});

export const resendOtpSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum(['email', 'phone']),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Book listing validation schemas
export const createBookListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  description: z.string().max(1000).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']),
  rentalType: z.enum(['FREE', 'PAID']),
  rentalPrice: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
  rentalDuration: z.number().int().min(1).max(90),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1),
  }),
});

// Search validation schema
export const searchBooksSchema = z.object({
  query: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(0.1).max(50).default(5), // km
  rentalType: z.enum(['FREE', 'PAID']).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Transaction validation schemas
export const createBorrowRequestSchema = z.object({
  bookListingId: z.string().cuid('Invalid book listing ID'),
});

export const approveBorrowRequestSchema = z.object({
  requestId: z.string().cuid('Invalid request ID'),
});

export const rejectBorrowRequestSchema = z.object({
  requestId: z.string().cuid('Invalid request ID'),
  rejectionReason: z.string().min(1).max(500),
});

// Review validation schema
export const createReviewSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  revieweeId: z.string().cuid('Invalid reviewee ID'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// Dispute validation schemas
export const createDisputeSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  reason: z.enum(['DAMAGE', 'NOT_RETURNED', 'WRONG_CONDITION', 'OTHER']),
  description: z.string().min(10).max(1000),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().cuid('Invalid dispute ID'),
  resolutionOutcome: z.enum(['REFUND_TO_BORROWER', 'KEEP_WITH_LENDER', 'SPLIT_50_50']),
  resolutionNotes: z.string().min(1).max(1000),
});

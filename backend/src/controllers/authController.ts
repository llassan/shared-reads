import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  refreshTokenSchema,
} from '../utils/validationSchemas';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  isOtpExpired,
} from '../utils/otp';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendOtpEmail, sendWelcomeEmail } from '../services/emailService';
import { sendOtpSms } from '../services/smsService';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists (build conditions dynamically: an
  // undefined phone inside OR would match every row)
  const duplicateConditions: { email?: string; phone?: string }[] = [
    { email: validatedData.email },
  ];
  if (validatedData.phone) {
    duplicateConditions.push({ phone: validatedData.phone });
  }
  const existingUser = await prisma.user.findFirst({
    where: { OR: duplicateConditions },
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      throw new ConflictError('Email already registered');
    }
    throw new ConflictError('Phone number already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(validatedData.password);

  // Generate OTPs (phone OTP only when a phone number was provided)
  const emailOtp = generateOtp();
  const phoneOtp = validatedData.phone ? generateOtp() : null;

  const emailOtpHash = await hashOtp(emailOtp);
  const phoneOtpHash = phoneOtp ? await hashOtp(phoneOtp) : null;
  const otpExpiresAt = getOtpExpiry();

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      phone: validatedData.phone,
      passwordHash,
      name: validatedData.name,
      emailOtpHash,
      phoneOtpHash,
      otpExpiresAt,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
    },
  });

  // Send OTPs (run in parallel) - skip in development if services not configured
  try {
    const otpSends: Promise<void>[] = [
      sendOtpEmail({
        email: user.email,
        otp: emailOtp,
        name: user.name || undefined,
      }),
    ];
    if (user.phone && phoneOtp) {
      otpSends.push(sendOtpSms({ phone: user.phone, otp: phoneOtp }));
    }
    await Promise.all(otpSends);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Email/SMS service not configured - OTPs printed above');
    } else {
      throw error;
    }
  }

  res.status(201).json({
    success: true,
    message: user.phone
      ? 'User registered successfully. Please verify your email and phone.'
      : 'User registered successfully. Please verify your email.',
    data: {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    },
  });
});

/**
 * Verify OTP codes
 * POST /api/v1/auth/verify-otp
 */
export const verifyOtpCodes = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const needsPhoneOtp = Boolean(user.phone);

    if (user.emailVerified && (!needsPhoneOtp || user.phoneVerified)) {
      throw new ValidationError('User already verified');
    }

    if (
      !user.otpExpiresAt ||
      !user.emailOtpHash ||
      (needsPhoneOtp && !user.phoneOtpHash)
    ) {
      throw new ValidationError('OTP expired or not found. Please request a new one.');
    }

    if (isOtpExpired(user.otpExpiresAt)) {
      throw new ValidationError('OTP expired. Please request a new one.');
    }

    if (needsPhoneOtp && !validatedData.phoneOtp) {
      throw new ValidationError('Phone OTP is required');
    }

    // Verify OTPs (phone only for accounts that registered with one)
    const isEmailOtpValid = await verifyOtp(validatedData.emailOtp, user.emailOtpHash);
    if (!isEmailOtpValid) {
      throw new ValidationError('Invalid email OTP');
    }

    if (needsPhoneOtp) {
      const isPhoneOtpValid = await verifyOtp(
        validatedData.phoneOtp!,
        user.phoneOtpHash!
      );
      if (!isPhoneOtpValid) {
        throw new ValidationError('Invalid phone OTP');
      }
    }

    // Update user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        phoneVerified: needsPhoneOtp,
        emailOtpHash: null,
        phoneOtpHash: null,
        otpExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        profilePhoto: true,
        location: true,
        emailVerified: true,
        phoneVerified: true,
        reputationScore: true,
        accountStatus: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    // Send welcome email
    if (updatedUser.name) {
      await sendWelcomeEmail({ email: updatedUser.email, name: updatedUser.name });
    }

    // Generate tokens
    const accessToken = generateAccessToken(updatedUser.id, updatedUser.email);
    const refreshToken = generateRefreshToken(updatedUser.id, updatedUser.email);

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: {
        user: updatedUser,
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * Resend OTP
 * POST /api/v1/auth/resend-otp
 */
export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = resendOtpSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: validatedData.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.emailVerified && (!user.phone || user.phoneVerified)) {
    throw new ValidationError('User already verified');
  }

  // Generate new OTP
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const otpExpiresAt = getOtpExpiry();

  if (validatedData.type === 'email') {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtpHash: otpHash, otpExpiresAt },
    });

    try {
      await sendOtpEmail({
        email: user.email,
        otp,
        name: user.name || undefined,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✉️  Email OTP for ${user.email}: ${otp}`);
      } else {
        throw error;
      }
    }
  } else {
    if (!user.phone) {
      throw new ValidationError('No phone number on this account');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { phoneOtpHash: otpHash, otpExpiresAt },
    });

    try {
      await sendOtpSms({ phone: user.phone, otp });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Phone OTP for ${user.phone}: ${otp}`);
      } else {
        throw error;
      }
    }
  }

  res.json({
    success: true,
    message: `OTP sent to ${validatedData.type}`,
  });
});

/**
 * Login
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw new UnauthorizedError('Account is suspended or deleted');
  }

  const isPasswordValid = await verifyPassword(
    validatedData.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.emailVerified || (user.phone !== null && !user.phoneVerified)) {
    throw new UnauthorizedError(
      'Please verify your account before logging in'
    );
  }

  // Update last login time
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      profilePhoto: true,
      location: true,
      emailVerified: true,
      phoneVerified: true,
      reputationScore: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(updatedUser.id, updatedUser.email);
  const refreshToken = generateRefreshToken(updatedUser.id, updatedUser.email);

  res.json({
    success: true,
    data: {
      user: updatedUser,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = refreshTokenSchema.parse(req.body);

    let payload;
    try {
      payload = verifyRefreshToken(validatedData.refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email);

    res.json({
      success: true,
      data: { accessToken },
    });
  }
);

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as any; // Type assertion for AuthRequest

  const user = await prisma.user.findUnique({
    where: { id: authReq.user.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      profilePhoto: true,
      location: true,
      emailVerified: true,
      phoneVerified: true,
      reputationScore: true,
      accountStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: { user },
  });
});

import { Router } from 'express';
import {
  register,
  verifyOtpCodes,
  resendOtp,
  login,
  refreshToken,
  getMe,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOtpCodes);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;

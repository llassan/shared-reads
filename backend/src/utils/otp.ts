import bcrypt from 'bcrypt';

/**
 * Generate a 6-digit OTP code
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP code for secure storage
 */
export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

/**
 * Verify an OTP against its hash
 */
export const verifyOtp = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

/**
 * Get OTP expiry time (10 minutes from now)
 */
export const getOtpExpiry = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

/**
 * Check if OTP has expired
 */
export const isOtpExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

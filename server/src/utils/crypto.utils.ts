import crypto from 'crypto';

/**
 * Generates a random 6-digit numeric OTP string.
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Creates a SHA-256 hash of the OTP for secure storage.
 */
export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verifies a raw OTP against a stored SHA-256 hash.
 */
export const verifyOtpHash = (otp: string, hash: string): boolean => {
  const computedHash = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
};

/**
 * Securely hashes a plain text password using PBKDF2 with a random salt.
 */
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedKey}`;
};

/**
 * Verifies a plain text password against a stored PBKDF2 hash.
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(key, 'hex'));
};


import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim())
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain alphanumeric characters, underscores, and dots')
    .transform((val) => val.trim()),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required')
});

export const resetPasswordOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform((val) => val.toLowerCase().trim()),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginPasswordInput = z.infer<typeof loginPasswordSchema>;
export type ResetPasswordOtpInput = z.infer<typeof resetPasswordOtpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  refreshTokenSchema,
  loginPasswordSchema,
  resetPasswordOtpSchema,
  changePasswordSchema
} from './auth.schema';
import { verifyToken } from '../../utils/jwt.utils';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = sendOtpSchema.parse(req.body);
      const result = await AuthService.sendOtp(email);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyOtp(email, otp);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async loginPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginPasswordSchema.parse(req.body);
      const result = await AuthService.loginWithPassword(email, password);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = registerSchema.parse(req.body);

      // Email can come from registrationToken in Authorization header or body
      let email: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        email = payload.email;
      } else if (req.body.registrationToken) {
        const payload = verifyToken(req.body.registrationToken);
        email = payload.email;
      }

      if (!email) {
        throw new ApiError(401, 'Registration token or valid auth token is required');
      }

      const result = await AuthService.registerUser(email, username, password);
      res.status(201).json({ success: true, message: 'Registration complete', ...result });
    } catch (err) {
      next(err);
    }
  }

  static async resetPasswordOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = resetPasswordOtpSchema.parse(req.body);
      const result = await AuthService.resetPasswordWithOtp(email, otp, newPassword);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshTokens(refreshToken);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const result = await AuthService.logout(userId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}


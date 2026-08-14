import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { registerSchema } from '../auth/auth.schema';
import { ApiError } from '../../utils/ApiError';

export class UserController {
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const profile = await UserService.getMe(userId);
      res.status(200).json({ success: true, user: profile });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const updatedUser = await UserService.updateProfile(userId, req.body);
      res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  static async getRandomUsername(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = UserService.getRandomUsernameSuggestion();
      res.status(200).json({ success: true, username });
    } catch (err) {
      next(err);
    }
  }

  static async searchByEchoId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      const { echoId } = req.query;
      if (!echoId || typeof echoId !== 'string') {
        throw new ApiError(400, 'echoId query parameter is required');
      }
      const result = await UserService.searchByEchoId(userId, echoId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getUserByEchoId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { echoId } = req.params;
      const user = await UserService.getUserByEchoId(echoId);
      res.status(200).json({ success: true, ...user });
    } catch (err) {
      next(err);
    }
  }
}

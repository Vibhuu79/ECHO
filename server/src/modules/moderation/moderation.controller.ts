import { Response, NextFunction } from 'express';
import { ModerationService } from './moderation.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ApiError } from '../../utils/ApiError';

export class ModerationController {
  static async submitReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reporterId = req.user?.userId;
      if (!reporterId) throw new ApiError(401, 'Unauthorized');

      const { targetEchoId, category, context } = req.body;

      if (!targetEchoId || !category) {
        res.status(400).json({ error: 'targetEchoId and category are required' });
        return;
      }

      const result = await ModerationService.submitReport(
        reporterId,
        targetEchoId,
        category,
        context
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async blockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const { targetEchoId } = req.body;

      if (!targetEchoId) {
        res.status(400).json({ error: 'targetEchoId is required' });
        return;
      }

      const result = await ModerationService.blockUser(currentUserId, targetEchoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unblockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const { echoId } = req.params;

      if (!echoId) {
        res.status(400).json({ error: 'echoId parameter is required' });
        return;
      }

      const result = await ModerationService.unblockUser(currentUserId, echoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getBlockedUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const blockedUsers = await ModerationService.getBlockedUsers(currentUserId);
      res.status(200).json({ blockedUsers });
    } catch (error) {
      next(error);
    }
  }

  static async muteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const { targetEchoId } = req.body;

      if (!targetEchoId) {
        res.status(400).json({ error: 'targetEchoId is required' });
        return;
      }

      const result = await ModerationService.muteUser(currentUserId, targetEchoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unmuteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const { echoId } = req.params;

      if (!echoId) {
        res.status(400).json({ error: 'echoId parameter is required' });
        return;
      }

      const result = await ModerationService.unmuteUser(currentUserId, echoId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMutedUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) throw new ApiError(401, 'Unauthorized');

      const mutedUsers = await ModerationService.getMutedUsers(currentUserId);
      res.status(200).json({ mutedUsers });
    } catch (error) {
      next(error);
    }
  }
}

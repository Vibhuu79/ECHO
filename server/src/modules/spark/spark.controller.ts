import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SparkService } from './spark.service';

export class SparkController {
  /**
   * POST /api/sparks
   * Create a new spark post
   */
  static async createSpark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { text, latitude, longitude, durationMinutes, radius, placeName, accessType, passkey } = req.body;

      if (!text || latitude === undefined || longitude === undefined || !durationMinutes) {
        res.status(400).json({
          success: false,
          error: { message: 'text, latitude, longitude, and durationMinutes are required' }
        });
        return;
      }

      const spark = await SparkService.createSpark(
        userId,
        text,
        Number(longitude),
        Number(latitude),
        Number(durationMinutes),
        radius ? Number(radius) : 200,
        placeName ? String(placeName) : undefined,
        accessType === 'private' ? 'private' : 'public',
        passkey ? String(passkey) : undefined
      );

      res.status(201).json({
        success: true,
        data: { spark }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/sparks/nearby
   * Fetch active nearby sparks within ~200m
   */
  static async getNearbySparks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { latitude, longitude, radius, limit, offset } = req.query;

      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({
          success: false,
          error: { message: 'Latitude and longitude query parameters are required' }
        });
        return;
      }

      const latNum = parseFloat(latitude as string);
      const lonNum = parseFloat(longitude as string);
      const radiusNum = radius ? parseInt(radius as string, 10) : 200;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      const offsetNum = offset ? parseInt(offset as string, 10) : 0;

      const result = await SparkService.getNearbySparks(
        userId,
        lonNum,
        latNum,
        radiusNum,
        limitNum,
        offsetNum
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/sparks/:id
   * Fetch spark details and members roster
   */
  static async getSparkById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      const result = await SparkService.getSparkById(sparkId, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: { message: error.message || 'Spark not found' }
      });
    }
  }

  /**
   * POST /api/sparks/:id/join
   * Join a spark room (with optional passkey)
   */
  static async joinSpark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      const { passkey } = req.body || {};
      const result = await SparkService.joinSpark(sparkId, userId, passkey ? String(passkey) : undefined);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to join spark room' }
      });
    }
  }

  /**
   * POST /api/sparks/:id/kick
   * Kick a member from a spark room (creator only)
   */
  static async kickMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        res.status(400).json({ success: false, error: { message: 'targetUserId is required' } });
        return;
      }

      const result = await SparkService.kickSparkMember(sparkId, userId, String(targetUserId));

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to kick member from spark room' }
      });
    }
  }

  /**
   * POST /api/sparks/:id/leave
   * Leave a spark room
   */
  static async leaveSpark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      await SparkService.leaveSpark(sparkId, userId);

      res.status(200).json({
        success: true,
        data: { message: 'Left spark room' }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: { message: error.message || 'Failed to leave spark room' }
      });
    }
  }

  /**
   * DELETE /api/sparks/:id
   * Delete / cancel spark room (creator only)
   */
  static async deleteSpark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      await SparkService.deleteSpark(sparkId, userId);

      res.status(200).json({
        success: true,
        data: { message: 'Spark room deleted' }
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: { message: error.message || 'Could not delete spark room' }
      });
    }
  }

  /**
   * GET /api/sparks/:id/messages
   * Fetch spark message history
   */
  static async getSparkMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const sparkId = req.params.id;
      const { limit, before } = req.query;

      const limitNum = limit ? parseInt(limit as string, 10) : 50;
      const beforeStr = before as string | undefined;

      const result = await SparkService.getSparkMessages(sparkId, userId, limitNum, beforeStr);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: { message: error.message || 'Failed to fetch spark messages' }
      });
    }
  }
}

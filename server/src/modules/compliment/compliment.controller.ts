import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ComplimentService } from './compliment.service';


export class ComplimentController {
  /**
   * GET /api/compliments/templates
   * List available compliment categories and templates
   */
  public static async getTemplates(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const templates = ComplimentService.getTemplates();
      res.status(200).json({
        success: true,
        templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch compliment templates.' }
      });
    }
  }

  /**
   * GET /api/compliments/status
   * Get user's daily secret compliment availability status
   */
  public static async getDailyStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const status = await ComplimentService.getDailyStatus(userId);
      res.status(200).json({
        success: true,
        status
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch daily compliment status.' }
      });
    }
  }

  /**
   * POST /api/compliments/send
   * Send a secret compliment to a target user
   */
  public static async sendCompliment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { targetEchoId, templateId } = req.body;
      if (!targetEchoId || !templateId) {
        res.status(400).json({
          success: false,
          error: { message: 'Both targetEchoId and templateId are required.' }
        });
        return;
      }

      const result = await ComplimentService.sendCompliment(userId, targetEchoId, templateId);
      res.status(201).json({
        success: true,
        message: result.message,
        complimentId: result.complimentId
      });
    } catch (error: any) {
      const message = error.message || 'Failed to send compliment.';
      if (message.includes('DAILY_LIMIT_REACHED')) {
        res.status(429).json({ success: false, error: { message } });
        return;
      }
      if (message.includes('TARGET_USER_NOT_FOUND') || message.includes('INVALID_TEMPLATE')) {
        res.status(400).json({ success: false, error: { message } });
        return;
      }
      if (message.includes('TRUST_SCORE_RESTRICTED') || message.includes('USER_BLOCKED')) {
        res.status(403).json({ success: false, error: { message } });
        return;
      }

      res.status(500).json({ success: false, error: { message } });
    }
  }

  /**
   * GET /api/compliments/received
   * Get user's received compliments history
   */
  public static async getReceivedCompliments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const compliments = await ComplimentService.getReceivedCompliments(userId);
      res.status(200).json({
        success: true,
        compliments
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch received compliments.' }
      });
    }
  }
}

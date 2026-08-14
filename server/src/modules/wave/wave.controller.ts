import { Request, Response } from 'express';
import { WaveService } from './wave.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class WaveController {
  public static async sendWave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderId = req.user?.userId;
      if (!senderId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { targetEchoId, iceBreakerId, iceBreakerText } = req.body;
      if (!targetEchoId) {
        res.status(400).json({ error: 'targetEchoId is required' });
        return;
      }

      let textToUse = iceBreakerText;
      if (iceBreakerId && !textToUse) {
        const icebreaker = await WaveService.getIcebreakers();
        const found = icebreaker.find((ib) => ib._id.toString() === iceBreakerId);
        if (found) {
          textToUse = found.text;
        }
      }

      const { wave, targetUserId } = await WaveService.sendWave(senderId, targetEchoId, textToUse);

      res.status(201).json({
        waveId: wave._id.toString(),
        status: wave.status,
        targetUserId,
        message: 'Wave sent successfully 👋'
      });
    } catch (err: any) {
      console.error('Send Wave Error:', err.message);
      if (err.message.startsWith('WAVE_RATE_LIMIT_EXCEEDED')) {
        res.status(429).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err.message });
    }
  }

  public static async getPendingWaves(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const waves = await WaveService.getPendingWaves(userId);
      res.status(200).json({ waves });
    } catch (err: any) {
      console.error('Get Pending Waves Error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async acceptWave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await WaveService.acceptWave(id, userId);

      res.status(200).json({
        conversationId: result.conversationId,
        message: 'Wave accepted. You can now chat.'
      });
    } catch (err: any) {
      console.error('Accept Wave Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async ignoreWave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await WaveService.ignoreWave(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Ignore Wave Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async blockUserViaWave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await WaveService.blockUserViaWave(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Block User Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async getIcebreakers(_req: Request, res: Response): Promise<void> {
    try {
      const icebreakers = await WaveService.getIcebreakers();
      res.status(200).json({ icebreakers });
    } catch (err: any) {
      console.error('Get Icebreakers Error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

import { Response } from 'express';
import { ChatService } from './chat.service';
import { AuthRequest } from '../../middleware/auth.middleware';

export class ChatController {
  public static async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await ChatService.getUserConversations(userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Get Conversations Error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async getConversationDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const details = await ChatService.getConversationDetails(id, userId);
      res.status(200).json(details);
    } catch (err: any) {
      console.error('Get Conversation Details Error:', err.message);
      res.status(404).json({ error: err.message });
    }
  }

  public static async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const before = req.query.before as string | undefined;

      const result = await ChatService.getMessages(id, userId, limit, before);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Get Messages Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async continueConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await ChatService.continueConversation(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Continue Conversation Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async saveConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await ChatService.saveConversation(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Save Conversation Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  public static async deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const result = await ChatService.deleteConversation(id, userId);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Delete Conversation Error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

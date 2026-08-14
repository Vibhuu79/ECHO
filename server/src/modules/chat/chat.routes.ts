import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/conversations', authenticateToken, ChatController.getConversations);
router.get('/conversations/:id', authenticateToken, ChatController.getConversationDetails);
router.get('/conversations/:id/messages', authenticateToken, ChatController.getMessages);
router.patch('/conversations/:id/continue', authenticateToken, ChatController.continueConversation);
router.patch('/conversations/:id/save', authenticateToken, ChatController.saveConversation);
router.delete('/conversations/:id', authenticateToken, ChatController.deleteConversation);

export default router;

import { Router } from 'express';
import { ModerationController } from './moderation.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.post('/reports', authenticateJWT, ModerationController.submitReport);

router.post('/blocks', authenticateJWT, ModerationController.blockUser);
router.delete('/blocks/:echoId', authenticateJWT, ModerationController.unblockUser);
router.get('/blocks', authenticateJWT, ModerationController.getBlockedUsers);

router.post('/mutes', authenticateJWT, ModerationController.muteUser);
router.delete('/mutes/:echoId', authenticateJWT, ModerationController.unmuteUser);
router.get('/mutes', authenticateJWT, ModerationController.getMutedUsers);

export default router;

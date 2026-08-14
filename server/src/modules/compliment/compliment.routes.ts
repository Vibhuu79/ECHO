import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { ComplimentController } from './compliment.controller';


const router = Router();

router.get('/templates', authenticateJWT, ComplimentController.getTemplates);
router.get('/status', authenticateJWT, ComplimentController.getDailyStatus);
router.post('/send', authenticateJWT, ComplimentController.sendCompliment);
router.get('/received', authenticateJWT, ComplimentController.getReceivedCompliments);

export const complimentRoutes = router;

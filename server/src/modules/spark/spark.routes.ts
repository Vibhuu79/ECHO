import { Router } from 'express';
import { SparkController } from './spark.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/sparks', authenticateToken, SparkController.createSpark);
router.get('/sparks/nearby', authenticateToken, SparkController.getNearbySparks);
router.get('/sparks/:id', authenticateToken, SparkController.getSparkById);
router.post('/sparks/:id/join', authenticateToken, SparkController.joinSpark);
router.post('/sparks/:id/kick', authenticateToken, SparkController.kickMember);
router.post('/sparks/:id/leave', authenticateToken, SparkController.leaveSpark);
router.delete('/sparks/:id', authenticateToken, SparkController.deleteSpark);
router.get('/sparks/:id/messages', authenticateToken, SparkController.getSparkMessages);

export default router;

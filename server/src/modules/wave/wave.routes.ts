import { Router } from 'express';
import { WaveController } from './wave.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Icebreakers list (Authenticated)
router.get('/icebreakers', authenticateToken, WaveController.getIcebreakers);

// Wave routes (Authenticated)
router.post('/waves', authenticateToken, WaveController.sendWave);
router.get('/waves/pending', authenticateToken, WaveController.getPendingWaves);
router.patch('/waves/:id/accept', authenticateToken, WaveController.acceptWave);
router.patch('/waves/:id/ignore', authenticateToken, WaveController.ignoreWave);
router.patch('/waves/:id/block', authenticateToken, WaveController.blockUserViaWave);

export default router;

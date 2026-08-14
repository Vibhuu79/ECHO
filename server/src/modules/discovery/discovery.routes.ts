import { Router } from 'express';
import { DiscoveryController } from './discovery.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/discover/nearby
router.get('/nearby', authenticateJWT, DiscoveryController.getNearby);

// PATCH /api/users/me/location
router.patch('/me/location', authenticateJWT, DiscoveryController.updateLocation);

// PATCH /api/users/me/mood
router.patch('/me/mood', authenticateJWT, DiscoveryController.updateMood);

export default router;

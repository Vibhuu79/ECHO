import { Router } from 'express';
import { UserController } from './user.controller';
import { DiscoveryController } from '../discovery/discovery.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticateJWT, UserController.getMe);
router.patch('/me/profile', authenticateJWT, UserController.updateProfile);
router.get('/random-username', authenticateJWT, UserController.getRandomUsername);
router.get('/search-id', authenticateJWT, UserController.searchByEchoId);
router.patch('/me/location', authenticateJWT, DiscoveryController.updateLocation);
router.patch('/me/mood', authenticateJWT, DiscoveryController.updateMood);
router.get('/:echoId', authenticateJWT, UserController.getUserByEchoId);

export default router;


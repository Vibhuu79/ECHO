import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/login', AuthController.loginPassword);
router.post('/register', AuthController.register);
router.post('/reset-password-otp', AuthController.resetPasswordOtp);
router.post('/change-password', authenticateJWT, AuthController.changePassword);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', authenticateJWT, AuthController.logout);

export default router;

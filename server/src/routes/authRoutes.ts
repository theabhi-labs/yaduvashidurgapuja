import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidators';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword
);

router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  AuthController.verifyEmail
);

router.post('/resend-verification', authenticate, AuthController.resendVerification);

export default router;

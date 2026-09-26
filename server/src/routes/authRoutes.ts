import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';
import { upload } from '../middleware/uploadMiddleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidators';

const router = Router();

// Check Username Availability
router.get('/check-username', AuthController.checkUsername);

// Search Devotees / Members (by name or @username)
router.get('/members/search', AuthController.searchMembers);

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

// Update Profile & Username
router.patch('/profile', authenticate, AuthController.updateProfile);

// Upload & Remove Profile Avatar Photo
router.post('/avatar', authenticate, upload.single('avatar'), AuthController.uploadAvatar);
router.delete('/avatar', authenticate, AuthController.removeAvatar);

// OTP Forgot Password Flow
router.post(
  '/forgot-password',
  otpLimiter,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/verify-otp',
  authLimiter,
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp
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

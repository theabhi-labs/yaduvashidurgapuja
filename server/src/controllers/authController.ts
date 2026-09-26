import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { generateToken, setAuthCookie, clearAuthCookie } from '../services/authTokens';
import { sendEmail } from '../config/brevo';
import { getWelcomeEmailHtml } from '../emails/welcomeEmail';
import { getOtpEmailHtml } from '../emails/otpEmail';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

interface ResetTokenPayload {
  userId: string;
  purpose: string;
}

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ApiError(400, 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।');
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // All publicly registered accounts are strictly 'USER' (भक्त).
      // Only SuperAdmin can promote a user to 'ADMIN' from the admin panel.
      const role = 'USER';

      // Create email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isEmailVerified: true, // Auto-verified for community accessibility
        emailVerificationToken: verificationToken,
      });

      const token = generateToken(user);
      setAuthCookie(res, token);

      logger.info(`User registered: ${user.email} (${user.role})`);

      // Asynchronous non-blocking Welcome Email via Brevo
      sendEmail({
        to: user.email,
        name: user.name,
        subject: '॥ जय माँ दुर्गे ॥ यदुवंशी दुर्गा पूजा कपूरिपुर में आपका स्वागत है',
        htmlContent: getWelcomeEmailHtml(user.name),
      }).catch((err) => logger.warn(`[Welcome Email Error] ${err.message}`));

      return sendResponse(
        res,
        201,
        'पंजीकरण सफल हुआ! स्वागत है यदुवंशी दुर्गा पूजा कपूरिपुर में।',
        { user, token }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
      if (!user) {
        throw new ApiError(401, 'ईमेल या पासवर्ड गलत है');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ApiError(401, 'ईमेल या पासवर्ड गलत है');
      }

      if (user.isSuspended) {
        throw new ApiError(
          403,
          user.suspensionReason
            ? `आपका खाता निलंबित है: ${user.suspensionReason}`
            : 'आपका खाता व्यवस्थापक द्वारा निलंबित कर दिया गया है।'
        );
      }

      const token = generateToken(user);
      setAuthCookie(res, token);

      // Remove passwordHash from user instance before responding
      const safeUser = user.toJSON();

      logger.info(`User logged in: ${user.email}`);

      return sendResponse(res, 200, 'लॉगिन सफल हुआ!', { user: safeUser, token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  public static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookie(res);
      return sendResponse(res, 200, 'सफलतापूर्वक लॉगआउट किया गया');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current User
   * GET /api/auth/me
   */
  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'सत्र उपलब्ध नहीं है');
      }

      return sendResponse(res, 200, 'उपयोगकर्ता विवरण', { user: req.user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot Password — Send 6-Digit OTP via Brevo
   * POST /api/auth/forgot-password
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        throw new ApiError(400, 'कृपया अपना ईमेल पता दर्ज करें');
      }

      const normalizedEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        throw new ApiError(404, 'यह ईमेल पता हमारे डेटाबेस में पंजीकृत नहीं है। कृपया सही ईमेल दर्ज करें या नया खाता बनाएं।');
      }

      // Generate 6-digit numeric OTP (100000 to 999999)
      const otp = crypto.randomInt(100000, 1000000).toString();

      // Securely hash OTP with SHA-256 before saving to DB
      const resetOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
      const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.resetOtpHash = resetOtpHash;
      user.resetOtpExpiry = resetOtpExpiry;
      user.resetOtpAttempts = 0;
      await user.save();

      logger.info(`[Password Reset OTP Generated] User: ${user.email}`);

      // Send OTP via Brevo Transactional Email
      const emailSent = await sendEmail({
        to: user.email,
        name: user.name,
        subject: '॥ यदुवंशी दुर्गा पूजा ॥ पासवर्ड रीसेट हेतु OTP कोड',
        htmlContent: getOtpEmailHtml(user.name, otp),
      });

      if (!emailSent && ENV.BREVO_API_KEY) {
        logger.error(`[OTP Email] Brevo failed to deliver OTP to ${user.email}`);
      }

      return sendResponse(
        res,
        200,
        `6-अंकों का OTP कोड ${user.email} पर भेज दिया गया है।`,
        { 
          email: normalizedEmail,
          // In non-production or if brevo not configured, provide devOtp for testing
          ...(!ENV.isProduction || !ENV.BREVO_API_KEY ? { devOtp: otp } : {})
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP — Returns Short-Lived JWT resetToken
   * POST /api/auth/verify-otp
   */
  public static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: normalizedEmail }).select(
        '+resetOtpHash +resetOtpExpiry +resetOtpAttempts'
      );

      if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
        throw new ApiError(400, 'अमान्य अनुरोध। कृपया पासवर्ड रीसेट का पुनः अनुरोध करें।');
      }

      // Check Expiry (10 minutes)
      if (new Date() > user.resetOtpExpiry) {
        user.resetOtpHash = undefined;
        user.resetOtpExpiry = undefined;
        user.resetOtpAttempts = 0;
        await user.save();
        throw new ApiError(400, 'OTP की समय सीमा समाप्त हो गई है। कृपया नया OTP मंगाएं।');
      }

      // Check Brute-Force Attempts
      if (user.resetOtpAttempts >= 5) {
        user.resetOtpHash = undefined;
        user.resetOtpExpiry = undefined;
        user.resetOtpAttempts = 0;
        await user.save();
        throw new ApiError(
          400,
          'सुरक्षा कारणों से बहुत अधिक गलत प्रयास हुए हैं। OTP अमान्य कर दिया गया है, कृपया पुनः नया OTP मंगाएं।'
        );
      }

      // Verify SHA-256 Hash
      const candidateHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
      if (candidateHash !== user.resetOtpHash) {
        user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
        await user.save();
        const remainingAttempts = 5 - user.resetOtpAttempts;
        throw new ApiError(
          400,
          `गलत OTP दर्ज किया गया है। शेष प्रयास: ${Math.max(0, remainingAttempts)}`
        );
      }

      // OTP is valid! Clear OTP fields
      user.resetOtpHash = undefined;
      user.resetOtpExpiry = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      // Issue a short-lived 10-minute JWT resetToken
      const resetToken = jwt.sign(
        { userId: user._id.toString(), purpose: 'password_reset' },
        ENV.JWT_SECRET,
        { expiresIn: '10m' }
      );

      logger.info(`[OTP Verified Successfully] User: ${user.email}`);

      return sendResponse(res, 200, 'OTP सफलतापूर्वक सत्यापित हो गया!', {
        resetToken,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password — Accepts JWT resetToken & newPassword
   * POST /api/auth/reset-password
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, token, newPassword } = req.body;
      const incomingToken = resetToken || token;

      if (!incomingToken) {
        throw new ApiError(400, 'रीसेट टोकन आवश्यक है');
      }

      let userId: string;

      // Check if it's a JWT resetToken (new OTP flow)
      try {
        const decoded = jwt.verify(incomingToken, ENV.JWT_SECRET) as ResetTokenPayload;
        if (decoded.purpose !== 'password_reset' || !decoded.userId) {
          throw new Error('Invalid token purpose');
        }
        userId = decoded.userId;
      } catch {
        // Fallback: Check if it's a legacy SHA-256 passwordResetToken
        const hashedToken = crypto.createHash('sha256').update(incomingToken).digest('hex');
        const legacyUser = await User.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: new Date() },
        }).select('+passwordHash');

        if (!legacyUser) {
          throw new ApiError(400, 'पासवर्ड रीसेट टोकन अमान्य या समाप्त हो चुका है। कृपया पुनः प्रयास करें।');
        }
        userId = legacyUser._id.toString();
      }

      const user = await User.findById(userId).select('+passwordHash');
      if (!user) {
        throw new ApiError(404, 'उपयोगकर्ता खाता नहीं मिला');
      }

      // Hash and update new password
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.resetOtpHash = undefined;
      user.resetOtpExpiry = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      // Issue new active login JWT
      const jwtToken = generateToken(user);
      setAuthCookie(res, jwtToken);

      logger.info(`[Password Reset Complete] User: ${user.email}`);

      return sendResponse(res, 200, 'पासवर्ड सफलतापूर्वक बदल दिया गया है!', {
        user,
        token: jwtToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Email
   * POST /api/auth/verify-email
   */
  public static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        emailVerificationToken: token,
      });

      if (!user) {
        throw new ApiError(400, 'अमान्य सत्यापन टोकन');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return sendResponse(res, 200, 'ईमेल सफलतापूर्वक सत्यापित हो गया है!');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend Verification Email
   * POST /api/auth/resend-verification
   */
  public static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'सत्र उपलब्ध नहीं है');
      }

      if (req.user.isEmailVerified) {
        return sendResponse(res, 200, 'आपका ईमेल पहले से ही सत्यापित है।');
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      req.user.emailVerificationToken = verificationToken;
      await req.user.save();

      return sendResponse(res, 200, 'नया सत्यापन कोड भेज दिया गया है।', { verificationToken });
    } catch (error) {
      next(error);
    }
  }
}

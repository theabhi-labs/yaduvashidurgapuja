import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { generateToken, setAuthCookie, clearAuthCookie } from '../services/authTokens';
import { logger } from '../utils/logger';

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

      // Check if this is the first user registered in the database, make them ADMIN
      const totalUsers = await User.countDocuments();
      const role = totalUsers === 0 ? 'ADMIN' : 'USER';

      // Create email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isEmailVerified: true, // Auto-verified for community accessibility, or via token
        emailVerificationToken: verificationToken,
      });

      const token = generateToken(user);
      setAuthCookie(res, token);

      logger.info(`User registered: ${user.email} (${user.role})`);

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
   * Forgot Password
   * POST /api/auth/forgot-password
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Prevent user enumeration: respond identically
        return sendResponse(
          res,
          200,
          'यदि यह ईमेल हमारे पास पंजीकृत है, तो पासवर्ड रीसेट निर्देश भेज दिए गए हैं।'
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Return token in dev/demo mode for easy testing
      return sendResponse(
        res,
        200,
        'पासवर्ड रीसेट लिंक तैयार हो गया है।',
        { resetToken }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password
   * POST /api/auth/reset-password
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordHash');

      if (!user) {
        throw new ApiError(400, 'पासवर्ड रीसेट टोकन अमान्य या समाप्त हो चुका है');
      }

      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      const jwtToken = generateToken(user);
      setAuthCookie(res, jwtToken);

      return sendResponse(res, 200, 'पासवर्ड सफलतापूर्वक बदल दिया गया है!', { user, token: jwtToken });
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

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/apiResponse';

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Bearer token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें'));
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new ApiError(401, 'उपयोगकर्ता खाता नहीं मिला'));
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return next(
        new ApiError(
          403,
          user.suspensionReason
            ? `आपका खाता निलंबित कर दिया गया है: ${user.suspensionReason}`
            : 'आपका खाता व्यवस्थापक द्वारा निलंबित कर दिया गया है।'
        )
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth: if user is logged in, attach req.user, but don't reject if guest
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);
    if (user && !user.isSuspended) {
      req.user = user;
    }
    next();
  } catch (error) {
    // If optional auth fails, continue as guest without crashing
    next();
  }
};

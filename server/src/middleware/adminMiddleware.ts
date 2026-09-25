import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';

/**
 * Middleware to check if user has ADMIN or SUPERADMIN role
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें'));
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return next(new ApiError(403, 'इस कार्य के लिए व्यवस्थापक (Admin) अनुमति आवश्यक है'));
  }

  next();
};

/**
 * Middleware to check if user has SUPERADMIN role only
 */
export const requireSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError(401, 'सत्र उपलब्ध नहीं है, कृपया लॉगिन करें'));
  }

  if (req.user.role !== 'SUPERADMIN') {
    return next(
      new ApiError(
        403,
        'इस कार्य एवं सांख्यिकी अवलोकन हेतु केवल मुख्य व्यवस्थापक (Super Admin) अधिकृत हैं'
      )
    );
  }

  next();
};

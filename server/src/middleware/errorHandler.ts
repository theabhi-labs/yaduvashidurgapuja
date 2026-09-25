import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'सर्वर पर कोई समस्या उत्पन्न हुई है';
  let errors = err.errors;

  // Handle Mongoose Duplicate Key Error (e.g. unique email or compound index)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    if (field === 'email') {
      message = 'यह ईमेल पहले से पंजीकृत है';
    } else if (field === 'memoryId' && err.keyValue?.reporterId) {
      message = 'आप पहले ही इस स्मृति की रिपोर्ट कर चुके हैं';
    } else {
      message = `${field} पहले से मौजूद है`;
    }
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'अमान्य संसाधन पहचानकर्ता (Invalid ID)';
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `फ़ाइल का आकार ${ENV.MAX_FILE_SIZE_MB}MB से कम होना चाहिए`;
    } else {
      message = `अपलोड त्रुटि: ${err.message}`;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'अमान्य टोकन, कृपया पुनः लॉगिन करें';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'आपका सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें';
  }

  if (statusCode >= 500) {
    logger.error('Unhandled Server Error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(!ENV.isProduction && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'बहुत अधिक अनुरोध, कृपया कुछ समय बाद पुनः प्रयास करें।',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'सुरक्षा कारणों से बहुत अधिक प्रयास हुए हैं। कृपया 15 मिनट बाद पुनः प्रयास करें।',
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'अपलोड सीमा समाप्त हो गई है। कृपया 1 घंटे बाद पुनः प्रयास करें।',
  },
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'OTP अनुरोध सीमा: कृपया 1 मिनट बाद पुनः प्रयास करें।',
  },
});

import { z } from 'zod';

export const createMemorySchema = z.object({
  caption: z
    .string({ required_error: 'कृपया स्मृति का संक्षिप्त विवरण या शीर्षक लिखें' })
    .min(3, 'विवरण कम से कम 3 अक्षरों का होना चाहिए')
    .max(600, 'विवरण 600 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  year: z.coerce
    .number({ required_error: 'कृपया वर्ष दर्ज करें' })
    .min(1970, 'वर्ष 1970 या उसके बाद का होना चाहिए')
    .max(new Date().getFullYear() + 1, 'अमान्य वर्ष'),
});

export const updateMemorySchema = z.object({
  caption: z
    .string()
    .min(3, 'विवरण कम से कम 3 अक्षरों का होना चाहिए')
    .max(600, 'विवरण 600 अक्षरों से अधिक नहीं हो सकता')
    .trim()
    .optional(),
  year: z.coerce
    .number()
    .min(1970)
    .max(new Date().getFullYear() + 1)
    .optional(),
  status: z.enum(['published', 'hidden', 'deleted']).optional(),
});

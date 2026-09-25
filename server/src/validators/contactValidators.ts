import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string({ required_error: 'कृपया अपना नाम दर्ज करें' })
    .min(2, 'नाम कम से कम 2 अक्षरों का होना चाहिए')
    .max(80, 'नाम 80 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  email: z
    .string({ required_error: 'कृपया अपना ईमेल पता दर्ज करें' })
    .email('कृपया एक मान्य ईमेल दर्ज करें')
    .toLowerCase()
    .trim(),
  subject: z
    .string({ required_error: 'कृपया विषय (Subject) दर्ज करें' })
    .min(3, 'विषय कम से कम 3 अक्षरों का होना चाहिए')
    .max(120, 'विषय 120 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  message: z
    .string({ required_error: 'कृपया अपना संदेश दर्ज करें' })
    .min(10, 'संदेश कम से कम 10 अक्षरों का होना चाहिए')
    .max(1500, 'संदेश 1500 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
});

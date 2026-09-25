import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'कृपया अपना नाम दर्ज करें' })
    .min(2, 'नाम कम से कम 2 अक्षरों का होना चाहिए')
    .max(70, 'नाम 70 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  email: z
    .string({ required_error: 'कृपया अपना ईमेल पता दर्ज करें' })
    .email('कृपया एक मान्य ईमेल दर्ज करें')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'कृपया पासवर्ड दर्ज करें' })
    .min(6, 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए')
    .max(100, 'पासवर्ड 100 अक्षरों से अधिक नहीं हो सकता'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'कृपया ईमेल दर्ज करें' })
    .email('कृपया एक मान्य ईमेल दर्ज करें')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'कृपया पासवर्ड दर्ज करें' }).min(1, 'पासवर्ड आवश्यक है'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'कृपया ईमेल दर्ज करें' })
    .email('कृपया एक मान्य ईमेल दर्ज करें')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'रीसेट टोकन आवश्यक है' }).min(1, 'टोकन आवश्यक है'),
  newPassword: z
    .string({ required_error: 'नया पासवर्ड दर्ज करें' })
    .min(6, 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए')
    .max(100, 'पासवर्ड 100 अक्षरों से अधिक नहीं हो सकता'),
});

export const verifyEmailSchema = z.object({
  token: z.string({ required_error: 'सत्यापन टोकन आवश्यक है' }).min(1, 'टोकन आवश्यक है'),
});

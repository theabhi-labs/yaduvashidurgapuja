import { z } from 'zod';

export const createCommitteeMemberSchema = z.object({
  name: z
    .string({ required_error: 'कृपया सदस्य का नाम दर्ज करें' })
    .min(2, 'नाम कम से कम 2 अक्षरों का होना चाहिए')
    .max(100, 'नाम 100 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  designation: z
    .string({ required_error: 'कृपया पद दर्ज करें' })
    .min(2, 'पद कम से कम 2 अक्षरों का होना चाहिए')
    .max(100, 'पद 100 अक्षरों से अधिक नहीं हो सकता')
    .trim(),
  bio: z.string().max(400, 'परिचय 400 अक्षरों से अधिक नहीं हो सकता').trim().optional(),
  displayOrder: z.coerce.number().optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateCommitteeMemberSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  designation: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(400).trim().optional(),
  displayOrder: z.coerce.number().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const reorderCommitteeSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number(),
    })
  ),
});

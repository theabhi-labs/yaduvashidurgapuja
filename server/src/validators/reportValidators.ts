import { z } from 'zod';

export const createReportSchema = z.object({
  memoryId: z.string({ required_error: 'स्मृति आईडी आवश्यक है' }),
  reason: z.enum(['inappropriate', 'spam', 'offensive', 'misleading', 'other'], {
    required_error: 'रिपोर्ट का कारण चुनना आवश्यक है',
  }),
  description: z.string().max(500, 'विवरण 500 अक्षरों से अधिक नहीं हो सकता').trim().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'dismissed']),
  adminNotes: z.string().max(500).optional(),
});

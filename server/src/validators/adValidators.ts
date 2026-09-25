import { z } from 'zod';

export const createAdSchema = z.object({
  title: z
    .string({ required_error: 'Ad title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  linkUrl: z
    .string({ required_error: 'Destination link URL is required' })
    .min(3, 'Destination URL is required')
    .trim(),
  sponsorName: z
    .string({ required_error: 'Sponsor name is required' })
    .min(2, 'Sponsor name must be at least 2 characters')
    .max(100, 'Sponsor name cannot exceed 100 characters')
    .trim(),
  priority: z.coerce.number().optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const updateAdSchema = z.object({
  title: z.string().min(2).max(150).trim().optional(),
  linkUrl: z.string().min(3).trim().optional(),
  sponsorName: z.string().min(2).max(100).trim().optional(),
  priority: z.coerce.number().optional(),
  isActive: z.coerce.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

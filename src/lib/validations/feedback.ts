import { z } from 'zod'

export const createFeedbackSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  category: z.enum(['feature', 'improvement', 'bug', 'other'], {
    error: 'Please select a category',
  }),
})

export const updateFeedbackSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  category: z.enum(['feature', 'improvement', 'bug', 'other']).optional(),
  status: z
    .enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed'])
    .optional(),
})

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed']),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>

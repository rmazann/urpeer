import { z } from 'zod'

export const createChangelogSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50000 characters'),
  category: z.enum(['feature', 'improvement', 'bugfix', 'breaking'], {
    error: 'Please select a category',
  }),
  published: z.boolean().default(false),
  feedback_ids: z.array(z.string().uuid()).optional(),
})

export const updateChangelogSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50000 characters')
    .optional(),
  category: z.enum(['feature', 'improvement', 'bugfix', 'breaking']).optional(),
  published: z.boolean().optional(),
  feedback_ids: z.array(z.string().uuid()).optional(),
})

export type CreateChangelogInput = z.infer<typeof createChangelogSchema>
export type UpdateChangelogInput = z.infer<typeof updateChangelogSchema>

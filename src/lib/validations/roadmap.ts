import { z } from 'zod'

export const createRoadmapItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: z.enum(['planned', 'in-progress', 'completed']).default('planned'),
  feedback_id: z.string().uuid().optional().nullable(),
  eta: z.string().max(100).optional().nullable(),
})

export const updateRoadmapItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  status: z.enum(['planned', 'in-progress', 'completed']).optional(),
  feedback_id: z.string().uuid().optional().nullable(),
  eta: z.string().max(100).optional().nullable(),
  display_order: z.number().int().min(0).optional(),
})

export const updateRoadmapOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().min(0),
      status: z.enum(['planned', 'in-progress', 'completed']),
    })
  ),
})

export type CreateRoadmapItemInput = z.infer<typeof createRoadmapItemSchema>
export type UpdateRoadmapItemInput = z.infer<typeof updateRoadmapItemSchema>
export type UpdateRoadmapOrderInput = z.infer<typeof updateRoadmapOrderSchema>

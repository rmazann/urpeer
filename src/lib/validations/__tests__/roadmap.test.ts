import { describe, it, expect } from 'vitest'
import { createRoadmapItemSchema, updateRoadmapItemSchema } from '../roadmap'

describe('createRoadmapItemSchema', () => {
  it('should validate a valid roadmap item', () => {
    const validInput = {
      title: 'Implement dark mode',
      description: 'Add dark mode support to the application.',
      status: 'planned',
    }

    const result = createRoadmapItemSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should allow minimal input with just title', () => {
    const minimalInput = {
      title: 'New feature',
    }

    const result = createRoadmapItemSchema.safeParse(minimalInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('planned') // default value
    }
  })

  it('should reject title shorter than 3 characters', () => {
    const invalidInput = {
      title: 'AB',
    }

    const result = createRoadmapItemSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept all valid statuses', () => {
    const statuses = ['planned', 'in_progress', 'completed']

    statuses.forEach((status) => {
      const input = {
        title: 'Valid title',
        status,
      }

      const result = createRoadmapItemSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid status', () => {
    const invalidInput = {
      title: 'Valid title',
      status: 'invalid-status',
    }

    const result = createRoadmapItemSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept optional feedback_id as UUID', () => {
    const validInput = {
      title: 'Valid title',
      feedback_id: '123e4567-e89b-12d3-a456-426614174000',
    }

    const result = createRoadmapItemSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject invalid feedback_id format', () => {
    const invalidInput = {
      title: 'Valid title',
      feedback_id: 'not-a-uuid',
    }

    const result = createRoadmapItemSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept optional eta string', () => {
    const validInput = {
      title: 'Valid title',
      eta: 'Q1 2026',
    }

    const result = createRoadmapItemSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })
})

describe('updateRoadmapItemSchema', () => {
  it('should allow partial updates', () => {
    const partialInput = {
      title: 'Updated title',
    }

    const result = updateRoadmapItemSchema.safeParse(partialInput)
    expect(result.success).toBe(true)
  })

  it('should allow updating only status', () => {
    const partialInput = {
      status: 'completed',
    }

    const result = updateRoadmapItemSchema.safeParse(partialInput)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updateRoadmapItemSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should allow updating display_order', () => {
    const input = {
      display_order: 5,
    }

    const result = updateRoadmapItemSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should reject negative display_order', () => {
    const input = {
      display_order: -1,
    }

    const result = updateRoadmapItemSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

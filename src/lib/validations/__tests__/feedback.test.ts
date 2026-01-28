import { describe, it, expect } from 'vitest'
import { createFeedbackSchema, updateFeedbackSchema } from '../feedback'

describe('createFeedbackSchema', () => {
  it('should validate a valid feedback input', () => {
    const validInput = {
      title: 'Add dark mode support',
      description: 'It would be great to have a dark mode option for the app.',
      category: 'feature',
    }

    const result = createFeedbackSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject title shorter than 3 characters', () => {
    const invalidInput = {
      title: 'AB',
      description: 'Valid description that is long enough.',
      category: 'feature',
    }

    const result = createFeedbackSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title')
    }
  })

  it('should reject title longer than 200 characters', () => {
    const invalidInput = {
      title: 'A'.repeat(201),
      description: 'Valid description that is long enough.',
      category: 'feature',
    }

    const result = createFeedbackSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject description shorter than 10 characters', () => {
    const invalidInput = {
      title: 'Valid title',
      description: 'Short',
      category: 'feature',
    }

    const result = createFeedbackSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description')
    }
  })

  it('should reject invalid category', () => {
    const invalidInput = {
      title: 'Valid title',
      description: 'Valid description that is long enough.',
      category: 'invalid-category',
    }

    const result = createFeedbackSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept all valid categories', () => {
    const categories = ['feature', 'improvement', 'bug', 'other']

    categories.forEach((category) => {
      const input = {
        title: 'Valid title',
        description: 'Valid description that is long enough.',
        category,
      }

      const result = createFeedbackSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})

describe('updateFeedbackSchema', () => {
  it('should allow partial updates', () => {
    const partialInput = {
      title: 'Updated title',
    }

    const result = updateFeedbackSchema.safeParse(partialInput)
    expect(result.success).toBe(true)
  })

  it('should allow updating only description', () => {
    const partialInput = {
      description: 'Updated description that is long enough.',
    }

    const result = updateFeedbackSchema.safeParse(partialInput)
    expect(result.success).toBe(true)
  })

  it('should allow updating status', () => {
    const statuses = ['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed']

    statuses.forEach((status) => {
      const input = { status }
      const result = updateFeedbackSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid status', () => {
    const input = { status: 'invalid-status' }
    const result = updateFeedbackSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should allow empty object', () => {
    const result = updateFeedbackSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

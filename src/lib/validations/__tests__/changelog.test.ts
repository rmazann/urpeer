import { describe, it, expect } from 'vitest'
import { createChangelogSchema, updateChangelogSchema } from '../changelog'

describe('createChangelogSchema', () => {
  it('should validate a valid changelog entry', () => {
    const validInput = {
      title: 'New Feature Release',
      content: 'We have added a new feature that allows users to...',
      category: 'feature',
    }

    const result = createChangelogSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject title shorter than 3 characters', () => {
    const invalidInput = {
      title: 'AB',
      content: 'Valid content that is long enough for validation.',
      category: 'feature',
    }

    const result = createChangelogSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject content shorter than 10 characters', () => {
    const invalidInput = {
      title: 'Valid Title',
      content: 'Short',
      category: 'feature',
    }

    const result = createChangelogSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept all valid categories', () => {
    const categories = ['feature', 'improvement', 'bugfix', 'breaking']

    categories.forEach((category) => {
      const input = {
        title: 'Valid Title',
        content: 'Valid content that is long enough for validation.',
        category,
      }

      const result = createChangelogSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid category', () => {
    const invalidInput = {
      title: 'Valid Title',
      content: 'Valid content that is long enough for validation.',
      category: 'invalid-category',
    }

    const result = createChangelogSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should have default published value of false', () => {
    const input = {
      title: 'Valid Title',
      content: 'Valid content that is long enough for validation.',
      category: 'feature',
    }

    const result = createChangelogSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.published).toBe(false)
    }
  })

  it('should accept optional feedback_ids array', () => {
    const validInput = {
      title: 'Valid Title',
      content: 'Valid content that is long enough for validation.',
      category: 'feature',
      feedback_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ],
    }

    const result = createChangelogSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })
})

describe('updateChangelogSchema', () => {
  it('should allow partial updates', () => {
    const partialInput = {
      title: 'Updated Title',
    }

    const result = updateChangelogSchema.safeParse(partialInput)
    expect(result.success).toBe(true)
  })

  it('should allow updating published status', () => {
    const input = {
      published: true,
    }

    const result = updateChangelogSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updateChangelogSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should allow updating category', () => {
    const input = {
      category: 'bugfix',
    }

    const result = updateChangelogSchema.safeParse(input)
    expect(result.success).toBe(true)
  })
})

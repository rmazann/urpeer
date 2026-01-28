import { describe, it, expect } from 'vitest'
import { createCommentSchema, updateCommentSchema } from '../comment'

describe('createCommentSchema', () => {
  it('should validate a valid comment', () => {
    const validInput = {
      content: 'This is a valid comment.',
    }

    const result = createCommentSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject empty content', () => {
    const invalidInput = {
      content: '',
    }

    const result = createCommentSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('empty')
    }
  })

  it('should reject content longer than 2000 characters', () => {
    const invalidInput = {
      content: 'A'.repeat(2001),
    }

    const result = createCommentSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should accept content at max length', () => {
    const validInput = {
      content: 'A'.repeat(2000),
    }

    const result = createCommentSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should accept single character content', () => {
    const validInput = {
      content: 'A',
    }

    const result = createCommentSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })
})

describe('updateCommentSchema', () => {
  it('should validate a valid update', () => {
    const validInput = {
      content: 'Updated comment content.',
    }

    const result = updateCommentSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('should reject empty content', () => {
    const invalidInput = {
      content: '',
    }

    const result = updateCommentSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })
})

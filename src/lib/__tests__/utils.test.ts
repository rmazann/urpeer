import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, formatDate, formatRelativeTime, calculatePriorityScore } from '../utils'

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toBe('px-2 py-1')
  })

  it('should merge and deduplicate tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toBe('base active')
  })

  it('should handle falsy values', () => {
    const result = cn('base', false, null, undefined, 'valid')
    expect(result).toBe('base valid')
  })

  it('should handle object syntax', () => {
    const result = cn('base', { active: true, disabled: false })
    expect(result).toBe('base active')
  })

  it('should handle array syntax', () => {
    const result = cn(['px-2', 'py-1'])
    expect(result).toBe('px-2 py-1')
  })
})

describe('formatDate', () => {
  it('should format a date string', () => {
    const result = formatDate('2026-01-15')
    expect(result).toBe('Jan 15, 2026')
  })

  it('should format a Date object', () => {
    const date = new Date('2026-06-20')
    const result = formatDate(date)
    expect(result).toBe('Jun 20, 2026')
  })

  it('should handle different date formats', () => {
    const result = formatDate('2026-12-25T10:30:00Z')
    expect(result).toBe('Dec 25, 2026')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for very recent times', () => {
    const result = formatRelativeTime('2026-01-28T11:59:30Z')
    expect(result).toBe('just now')
  })

  it('should return minutes ago', () => {
    const result = formatRelativeTime('2026-01-28T11:55:00Z')
    expect(result).toBe('5m ago')
  })

  it('should return hours ago', () => {
    const result = formatRelativeTime('2026-01-28T09:00:00Z')
    expect(result).toBe('3h ago')
  })

  it('should return days ago', () => {
    const result = formatRelativeTime('2026-01-26T12:00:00Z')
    expect(result).toBe('2d ago')
  })

  it('should return formatted date for older dates', () => {
    const result = formatRelativeTime('2026-01-01T12:00:00Z')
    expect(result).toBe('Jan 1, 2026')
  })
})

describe('calculatePriorityScore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return higher score for more votes', () => {
    const score1 = calculatePriorityScore(10, '2026-01-28T00:00:00Z')
    const score2 = calculatePriorityScore(20, '2026-01-28T00:00:00Z')
    expect(score2).toBeGreaterThan(score1)
  })

  it('should return lower score for older items', () => {
    const recentScore = calculatePriorityScore(10, '2026-01-28T00:00:00Z')
    const oldScore = calculatePriorityScore(10, '2025-12-28T00:00:00Z')
    expect(recentScore).toBeGreaterThan(oldScore)
  })

  it('should return 0 for 0 votes', () => {
    const score = calculatePriorityScore(0, '2026-01-28T00:00:00Z')
    expect(score).toBe(0)
  })

  it('should decay score over time', () => {
    const today = calculatePriorityScore(100, '2026-01-28T00:00:00Z')
    const thirtyDaysAgo = calculatePriorityScore(100, '2025-12-29T00:00:00Z')

    // Score should be approximately halved after 30 days
    expect(thirtyDaysAgo).toBeLessThan(today)
    expect(thirtyDaysAgo).toBeGreaterThan(today * 0.4)
    expect(thirtyDaysAgo).toBeLessThan(today * 0.6)
  })
})

'use server'

import { createClient } from '@/lib/supabase/server'
import type { ChangelogEntryWithDetails } from '@/lib/supabase/types'

export type PaginatedChangelog = {
  entries: ChangelogEntryWithDetails[]
  totalCount: number
  hasMore: boolean
}

export const getChangelogEntries = async (
  page: number = 1,
  limit: number = 10,
  includeUnpublished: boolean = false
): Promise<PaginatedChangelog> => {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('changelog_entries')
    .select(
      `
      *,
      profiles!changelog_entries_author_id_fkey(id, full_name),
      changelog_feedback_links(
        feedback(id, title)
      )
    `,
      { count: 'exact' }
    )
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (!includeUnpublished) {
    query = query.eq('published', true)
  }

  const { data: entries, error, count } = await query

  if (error) {
    console.error('Error fetching changelog entries:', error)
    return { entries: [], totalCount: 0, hasMore: false }
  }

  const totalCount = count ?? 0

  return {
    entries: (entries || []) as ChangelogEntryWithDetails[],
    totalCount,
    hasMore: offset + limit < totalCount,
  }
}

export const getChangelogEntryById = async (
  id: string
): Promise<ChangelogEntryWithDetails | null> => {
  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('changelog_entries')
    .select(
      `
      *,
      profiles!changelog_entries_author_id_fkey(id, full_name),
      changelog_feedback_links(
        feedback(id, title)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !entry) {
    return null
  }

  return entry as ChangelogEntryWithDetails
}

export const getChangelogForRSS = async (): Promise<ChangelogEntryWithDetails[]> => {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('changelog_entries')
    .select(
      `
      *,
      profiles!changelog_entries_author_id_fkey(id, full_name),
      changelog_feedback_links(
        feedback(id, title)
      )
    `
    )
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching changelog for RSS:', error)
    return []
  }

  return (entries || []) as ChangelogEntryWithDetails[]
}

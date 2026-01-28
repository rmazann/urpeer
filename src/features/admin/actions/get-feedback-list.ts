'use server'

import { createClient } from '@/lib/supabase/server'
import type { FeedbackWithAuthor } from '@/lib/supabase/types'

export type AdminFeedbackFilters = {
  status?: string
  category?: string
  search?: string
  page?: number
  limit?: number
}

export type PaginatedFeedback = {
  items: FeedbackWithAuthor[]
  totalCount: number
  hasMore: boolean
}

export const getAdminFeedbackList = async (
  filters: AdminFeedbackFilters = {}
): Promise<PaginatedFeedback> => {
  const supabase = await createClient()
  const { status, category, search, page = 1, limit = 20 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('feedback')
    .select('*, profiles(id, full_name, avatar_url)', { count: 'exact' })

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Order and paginate
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching admin feedback list:', error)
    return { items: [], totalCount: 0, hasMore: false }
  }

  const totalCount = count ?? 0

  return {
    items: (data || []) as FeedbackWithAuthor[],
    totalCount,
    hasMore: offset + limit < totalCount,
  }
}

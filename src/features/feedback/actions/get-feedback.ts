'use server'

import { createClient } from '@/lib/supabase/server'
import type { FeedbackWithAuthor } from '@/lib/supabase/types'

export type FeedbackFilters = {
  status?: string
  category?: string
  sortBy?: 'votes' | 'recent'
}

export const getFeedback = async (filters: FeedbackFilters = {}): Promise<FeedbackWithAuthor[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('feedback')
    .select('*, profiles(id, full_name, avatar_url)')

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  // Apply sorting
  if (filters.sortBy === 'votes') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: feedbackList, error } = await query

  if (error) {
    console.error('Error fetching feedback:', error)
    return []
  }

  if (!feedbackList) {
    return []
  }

  // If user is logged in, check which items they've voted on
  if (user) {
    const { data: userVotes } = await supabase
      .from('votes')
      .select('feedback_id')
      .eq('user_id', user.id)

    const votedFeedbackIds = new Set(userVotes?.map((v) => v.feedback_id) || [])

    return feedbackList.map((feedback) => ({
      ...feedback,
      user_has_voted: votedFeedbackIds.has(feedback.id),
    })) as FeedbackWithAuthor[]
  }

  return feedbackList.map((feedback) => ({
    ...feedback,
    user_has_voted: false,
  })) as FeedbackWithAuthor[]
}

export const getFeedbackById = async (id: string) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !feedback) {
    return null
  }

  let userHasVoted = false
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('id')
      .eq('feedback_id', id)
      .eq('user_id', user.id)
      .single()
    userHasVoted = !!vote
  }

  return {
    ...feedback,
    user_has_voted: userHasVoted,
  } as FeedbackWithAuthor
}

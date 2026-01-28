'use server'

import { createClient } from '@/lib/supabase/server'
import type { CommentWithAuthor } from '@/lib/supabase/types'

export const getCommentsByFeedbackId = async (
  feedbackId: string
): Promise<CommentWithAuthor[]> => {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, profiles!comments_author_id_fkey(id, full_name, avatar_url)')
    .eq('feedback_id', feedbackId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return (comments || []) as CommentWithAuthor[]
}

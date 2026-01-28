'use server'

import { createClient } from '@/lib/supabase/server'
import type { CommentWithAuthor } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

export const getCommentsByFeedbackId = async (
  feedbackId: string
): Promise<CommentWithAuthor[]> => {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('feedback_id', feedbackId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error('Failed to fetch comments', { action: 'getCommentsByFeedbackId', feedbackId }, error)
    return []
  }

  return (comments || []) as CommentWithAuthor[]
}

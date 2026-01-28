'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DeleteCommentResult = {
  success: boolean
  error?: string
}

export const deleteComment = async (
  commentId: string,
  feedbackId: string
): Promise<DeleteCommentResult> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to delete comments' }
  }

  // Check if user is admin or comment author
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Delete comment (admins can delete any, users can only delete their own)
  let query = supabase.from('comments').delete().eq('id', commentId)

  if (!isAdmin) {
    query = query.eq('author_id', user.id)
  }

  const { error } = await query

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}

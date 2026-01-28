'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateCommentSchema } from '@/lib/validations/comment'

export type UpdateCommentResult = {
  success: boolean
  error?: string
}

export const updateComment = async (
  commentId: string,
  feedbackId: string,
  content: string
): Promise<UpdateCommentResult> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to edit comments' }
  }

  // Validate content
  const validationResult = updateCommentSchema.safeParse({ content })

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || 'Invalid content',
    }
  }

  // Update comment (RLS will ensure user can only update their own comments)
  const { error } = await supabase
    .from('comments')
    .update({ content: validationResult.data.content })
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) {
    console.error('Error updating comment:', error)
    return { success: false, error: 'Failed to update comment' }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type DeleteFeedbackResult = {
  success: boolean
  error?: string
}

export const deleteFeedback = async (
  feedbackId: string
): Promise<DeleteFeedbackResult> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  // Check if user is admin or feedback author
  const { data: feedback } = await supabase
    .from('feedback')
    .select('author_id')
    .eq('id', feedbackId)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isAuthor = feedback?.author_id === user.id

  if (!isAdmin && !isAuthor) {
    return { success: false, error: 'You can only delete your own feedback' }
  }

  // Delete feedback (cascades to votes and comments)
  const { error } = await supabase.from('feedback').delete().eq('id', feedbackId)

  if (error) {
    logger.error('Failed to delete feedback', { action: 'deleteFeedback', feedbackId, userId: user.id }, error)
    return { success: false, error: 'Failed to delete feedback' }
  }

  revalidatePath('/feedback')
  return { success: true }
}

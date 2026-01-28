'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateFeedbackSchema } from '@/lib/validations/feedback'
import { sendStatusChangeNotification } from '@/features/notifications/actions/send-notification'
import { logger } from '@/lib/logger'

export type UpdateFeedbackResult = {
  success: boolean
  error?: string
}

export const updateFeedbackStatus = async (
  feedbackId: string,
  status: string
): Promise<UpdateFeedbackResult> => {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Only admins can change feedback status' }
  }

  // Get current feedback info for notification
  const { data: feedback } = await supabase
    .from('feedback')
    .select('author_id, title, status')
    .eq('id', feedbackId)
    .single()

  const oldStatus = feedback?.status

  // Update status
  const { error } = await supabase
    .from('feedback')
    .update({ status })
    .eq('id', feedbackId)

  if (error) {
    logger.error('Failed to update feedback status', { action: 'updateFeedbackStatus', feedbackId, status }, error)
    return { success: false, error: 'Failed to update status' }
  }

  // Send email notification to feedback author (async, don't wait)
  if (feedback && oldStatus !== status) {
    sendStatusChangeNotification(
      feedback.author_id,
      feedbackId,
      feedback.title,
      oldStatus || 'pending',
      status
    ).catch((err) => logger.error('Failed to send status change notification', { action: 'updateFeedbackStatus', feedbackId }, err))
  }

  revalidatePath('/feedback')
  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}

export const updateFeedback = async (
  feedbackId: string,
  data: { title?: string; description?: string; category?: string }
): Promise<UpdateFeedbackResult> => {
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
    return { success: false, error: 'You can only edit your own feedback' }
  }

  // Validate data
  const validationResult = updateFeedbackSchema.safeParse(data)
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || 'Invalid data',
    }
  }

  // Update feedback
  const { error } = await supabase
    .from('feedback')
    .update(validationResult.data)
    .eq('id', feedbackId)

  if (error) {
    logger.error('Failed to update feedback', { action: 'updateFeedback', feedbackId }, error)
    return { success: false, error: 'Failed to update feedback' }
  }

  revalidatePath('/feedback')
  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}

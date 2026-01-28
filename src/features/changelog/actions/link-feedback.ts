'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type LinkFeedbackResult = {
  success: boolean
  error?: string
}

export const linkFeedbackToChangelog = async (
  changelogId: string,
  feedbackId: string
): Promise<LinkFeedbackResult> => {
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
    return { success: false, error: 'Only admins can link feedback' }
  }

  // Check if link already exists
  const { data: existingLink } = await supabase
    .from('changelog_feedback_links')
    .select('id')
    .eq('changelog_id', changelogId)
    .eq('feedback_id', feedbackId)
    .single()

  if (existingLink) {
    return { success: false, error: 'Feedback is already linked' }
  }

  // Create link
  const { error } = await supabase.from('changelog_feedback_links').insert({
    changelog_id: changelogId,
    feedback_id: feedbackId,
  })

  if (error) {
    console.error('Error linking feedback:', error)
    return { success: false, error: 'Failed to link feedback' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

export const unlinkFeedbackFromChangelog = async (
  changelogId: string,
  feedbackId: string
): Promise<LinkFeedbackResult> => {
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
    return { success: false, error: 'Only admins can unlink feedback' }
  }

  // Delete link
  const { error } = await supabase
    .from('changelog_feedback_links')
    .delete()
    .eq('changelog_id', changelogId)
    .eq('feedback_id', feedbackId)

  if (error) {
    console.error('Error unlinking feedback:', error)
    return { success: false, error: 'Failed to unlink feedback' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

'use server'

import { resend, getFromAddress, isEmailEnabled } from '@/lib/email/client'
import { WelcomeEmail } from '@/lib/email/templates/welcome'
import { NewCommentEmail } from '@/lib/email/templates/new-comment'
import { StatusChangeEmail } from '@/lib/email/templates/status-change'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { NotificationPreferences } from '../types'

// Helper to check if user has enabled a specific notification type
const checkNotificationPreference = async (
  userId: string,
  preferenceKey: keyof NotificationPreferences
): Promise<{ enabled: boolean; email: string | null; fullName: string | null }> => {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { enabled: false, email: null, fullName: null }
  }

  // TODO: Add email_notifications column query after migration is applied
  // For now, default to all notifications enabled
  const preferences: NotificationPreferences = {
    new_comment: true,
    status_change: true,
    weekly_digest: false,
  }

  return {
    enabled: preferences[preferenceKey] ?? true,
    email: profile.email,
    fullName: profile.full_name,
  }
}

export const sendWelcomeEmail = async (userId: string, workspaceName?: string) => {
  if (!isEmailEnabled()) {
    logger.debug('Email is disabled, skipping welcome email', { action: 'sendWelcomeEmail' })
    return { success: true, skipped: true }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  if (!profile?.email) {
    return { error: 'User email not found' }
  }

  try {
    await resend!.emails.send({
      from: getFromAddress(),
      to: profile.email,
      subject: `Welcome to Urpeer${workspaceName ? ` - ${workspaceName}` : ''}!`,
      react: WelcomeEmail({
        userName: profile.full_name || 'there',
        workspaceName,
      }),
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send welcome email', { action: 'sendWelcomeEmail', userId }, error)
    return { error: 'Failed to send welcome email' }
  }
}

export const sendNewCommentNotification = async (
  feedbackAuthorId: string,
  commenterId: string,
  feedbackId: string,
  feedbackTitle: string,
  commentContent: string
) => {
  if (!isEmailEnabled()) {
    logger.debug('Email is disabled, skipping new comment notification', { action: 'sendNewCommentNotification' })
    return { success: true, skipped: true }
  }

  // Don't notify if the commenter is the feedback author
  if (feedbackAuthorId === commenterId) {
    return { success: true, skipped: true }
  }

  const { enabled, email, fullName } = await checkNotificationPreference(
    feedbackAuthorId,
    'new_comment'
  )

  if (!enabled || !email) {
    return { success: true, skipped: true }
  }

  // Get commenter info
  const supabase = await createClient()
  const { data: commenter } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', commenterId)
    .single()

  try {
    await resend!.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `New comment on "${feedbackTitle}"`,
      react: NewCommentEmail({
        recipientName: fullName || 'there',
        commenterName: commenter?.full_name || 'Someone',
        feedbackTitle,
        feedbackId,
        commentPreview: commentContent.slice(0, 200) + (commentContent.length > 200 ? '...' : ''),
      }),
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send new comment notification', { action: 'sendNewCommentNotification', feedbackId }, error)
    return { error: 'Failed to send notification' }
  }
}

export const sendStatusChangeNotification = async (
  feedbackAuthorId: string,
  feedbackId: string,
  feedbackTitle: string,
  oldStatus: string,
  newStatus: string,
  adminNote?: string
) => {
  if (!isEmailEnabled()) {
    logger.debug('Email is disabled, skipping status change notification', { action: 'sendStatusChangeNotification' })
    return { success: true, skipped: true }
  }

  const { enabled, email, fullName } = await checkNotificationPreference(
    feedbackAuthorId,
    'status_change'
  )

  if (!enabled || !email) {
    return { success: true, skipped: true }
  }

  try {
    await resend!.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `Your feedback status updated: "${feedbackTitle}"`,
      react: StatusChangeEmail({
        recipientName: fullName || 'there',
        feedbackTitle,
        feedbackId,
        oldStatus,
        newStatus,
        adminNote,
      }),
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to send status change notification', { action: 'sendStatusChangeNotification', feedbackId }, error)
    return { error: 'Failed to send notification' }
  }
}

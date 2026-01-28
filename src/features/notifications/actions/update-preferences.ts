'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import type { NotificationPreferences, NotificationPreferencesState } from '../types'

export const updateNotificationPreferences = async (
  _prevState: NotificationPreferencesState,
  formData: FormData
): Promise<NotificationPreferencesState> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const preferences: NotificationPreferences = {
    new_comment: formData.get('new_comment') === 'on',
    status_change: formData.get('status_change') === 'on',
    weekly_digest: formData.get('weekly_digest') === 'on',
  }

  // TODO: Enable after email_notifications migration is applied
  // For now, just log the preferences update
  logger.info('Notification preferences update requested (migration pending)', {
    action: 'updateNotificationPreferences',
    userId: user.id,
  })

  // Stub: Return success without actually updating
  // Uncomment below after migration:
  // const { error } = await supabase
  //   .from('profiles')
  //   .update({ email_notifications: preferences })
  //   .eq('id', user.id)
  // if (error) {
  //   logger.error('Failed to update notification preferences', { action: 'updateNotificationPreferences', userId: user.id }, error)
  //   return { error: 'Failed to update preferences' }
  // }
  void preferences

  revalidatePath('/profile/notifications')
  return { success: true }
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // TODO: Query email_notifications after migration is applied
  // For now, return default preferences
  return {
    new_comment: true,
    status_change: true,
    weekly_digest: false,
  }
}

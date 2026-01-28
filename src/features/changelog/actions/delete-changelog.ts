'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DeleteChangelogResult = {
  success: boolean
  error?: string
}

export const deleteChangelogEntry = async (
  entryId: string
): Promise<DeleteChangelogResult> => {
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
    return { success: false, error: 'Only admins can delete changelog entries' }
  }

  // Delete linked feedback first (due to foreign key)
  await supabase
    .from('changelog_feedback_links')
    .delete()
    .eq('changelog_id', entryId)

  // Delete the entry
  const { error } = await supabase
    .from('changelog_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting changelog entry:', error)
    return { success: false, error: 'Failed to delete changelog entry' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

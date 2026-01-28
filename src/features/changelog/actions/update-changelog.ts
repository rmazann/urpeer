'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type UpdateChangelogResult = {
  success: boolean
  error?: string
}

export const updateChangelogEntry = async (
  entryId: string,
  data: { title?: string; content?: string; category?: string }
): Promise<UpdateChangelogResult> => {
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
    return { success: false, error: 'Only admins can update changelog entries' }
  }

  // Update the entry
  const { error } = await supabase
    .from('changelog_entries')
    .update(data)
    .eq('id', entryId)

  if (error) {
    logger.error('Failed to update changelog entry', { action: 'updateChangelogEntry', entryId }, error)
    return { success: false, error: 'Failed to update changelog entry' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

export const publishChangelogEntry = async (
  entryId: string
): Promise<UpdateChangelogResult> => {
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
    return { success: false, error: 'Only admins can publish changelog entries' }
  }

  // Publish the entry
  const { error } = await supabase
    .from('changelog_entries')
    .update({
      published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', entryId)

  if (error) {
    logger.error('Failed to publish changelog entry', { action: 'publishChangelogEntry', entryId }, error)
    return { success: false, error: 'Failed to publish changelog entry' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

export const unpublishChangelogEntry = async (
  entryId: string
): Promise<UpdateChangelogResult> => {
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
    return { success: false, error: 'Only admins can unpublish changelog entries' }
  }

  // Unpublish the entry
  const { error } = await supabase
    .from('changelog_entries')
    .update({
      published: false,
      published_at: null,
    })
    .eq('id', entryId)

  if (error) {
    logger.error('Failed to unpublish changelog entry', { action: 'unpublishChangelogEntry', entryId }, error)
    return { success: false, error: 'Failed to unpublish changelog entry' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DeleteRoadmapResult = {
  success: boolean
  error?: string
}

export const deleteRoadmapItem = async (itemId: string): Promise<DeleteRoadmapResult> => {
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
    return { success: false, error: 'Only admins can manage roadmap items' }
  }

  // Delete the item
  const { error } = await supabase.from('roadmap_items').delete().eq('id', itemId)

  if (error) {
    console.error('Error deleting roadmap item:', error)
    return { success: false, error: 'Failed to delete roadmap item' }
  }

  revalidatePath('/roadmap')
  return { success: true }
}

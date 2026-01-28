'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type UpdateRoadmapResult = {
  success: boolean
  error?: string
}

export const updateRoadmapItemStatus = async (
  itemId: string,
  newStatus: string,
  newDisplayOrder: number
): Promise<UpdateRoadmapResult> => {
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

  // Update the item
  const { error } = await supabase
    .from('roadmap_items')
    .update({
      status: newStatus,
      display_order: newDisplayOrder,
    })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating roadmap item:', error)
    return { success: false, error: 'Failed to update roadmap item' }
  }

  revalidatePath('/roadmap')
  return { success: true }
}

export const reorderRoadmapItems = async (
  items: { id: string; display_order: number }[]
): Promise<UpdateRoadmapResult> => {
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

  // Update all items in a batch
  for (const item of items) {
    const { error } = await supabase
      .from('roadmap_items')
      .update({ display_order: item.display_order })
      .eq('id', item.id)

    if (error) {
      console.error('Error reordering roadmap item:', error)
      return { success: false, error: 'Failed to reorder items' }
    }
  }

  revalidatePath('/roadmap')
  return { success: true }
}

export const updateRoadmapItem = async (
  itemId: string,
  data: { title?: string; description?: string; eta?: string }
): Promise<UpdateRoadmapResult> => {
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

  // Update the item
  const { error } = await supabase
    .from('roadmap_items')
    .update(data)
    .eq('id', itemId)

  if (error) {
    console.error('Error updating roadmap item:', error)
    return { success: false, error: 'Failed to update roadmap item' }
  }

  revalidatePath('/roadmap')
  return { success: true }
}

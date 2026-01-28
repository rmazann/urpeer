'use server'

import { createClient } from '@/lib/supabase/server'
import type { RoadmapItemWithFeedback } from '@/lib/supabase/types'

export type RoadmapByStatus = {
  planned: RoadmapItemWithFeedback[]
  'in-progress': RoadmapItemWithFeedback[]
  completed: RoadmapItemWithFeedback[]
}

export const getRoadmapItems = async (): Promise<RoadmapByStatus> => {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('roadmap_items')
    .select('*, feedback(id, title, vote_count, category)')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching roadmap items:', error)
    return {
      planned: [],
      'in-progress': [],
      completed: [],
    }
  }

  const roadmapItems = (items || []) as RoadmapItemWithFeedback[]

  return {
    planned: roadmapItems.filter((item) => item.status === 'planned'),
    'in-progress': roadmapItems.filter((item) => item.status === 'in-progress'),
    completed: roadmapItems.filter((item) => item.status === 'completed'),
  }
}

export const getRoadmapItemById = async (id: string): Promise<RoadmapItemWithFeedback | null> => {
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('roadmap_items')
    .select('*, feedback(id, title, vote_count, category)')
    .eq('id', id)
    .single()

  if (error || !item) {
    return null
  }

  return item as RoadmapItemWithFeedback
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createRoadmapItemSchema } from '@/lib/validations/roadmap'

export type CreateRoadmapItemState = {
  error?: string
  success?: boolean
  fieldErrors?: {
    title?: string[]
    description?: string[]
    status?: string[]
    eta?: string[]
  }
} | null

export const createRoadmapItem = async (
  _prevState: CreateRoadmapItemState,
  formData: FormData
): Promise<CreateRoadmapItemState> => {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Only admins can manage roadmap items' }
  }

  // Parse and validate form data
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    status: formData.get('status') || 'planned',
    eta: formData.get('eta') || undefined,
    feedback_id: formData.get('feedback_id') || undefined,
  }

  const validationResult = createRoadmapItemSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: 'Please fix the errors below',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const { title, description, status, eta, feedback_id } = validationResult.data

  // Get workspace ID
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .limit(1)
    .single()

  if (!workspace) {
    return { error: 'No workspace found' }
  }

  // Get max display_order for the status column
  const { data: maxOrderItem } = await supabase
    .from('roadmap_items')
    .select('display_order')
    .eq('status', status)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const newDisplayOrder = (maxOrderItem?.display_order ?? 0) + 1

  // Calculate priority score if linked to feedback
  let priorityScore = 0
  if (feedback_id) {
    const { data: feedback } = await supabase
      .from('feedback')
      .select('vote_count, created_at')
      .eq('id', feedback_id)
      .single()

    if (feedback) {
      priorityScore = calculatePriorityScore(
        feedback.vote_count ?? 0,
        feedback.created_at ? new Date(feedback.created_at) : new Date()
      )
    }
  }

  // Insert roadmap item
  const { error } = await supabase.from('roadmap_items').insert({
    title,
    description: description || null,
    status,
    eta: eta || null,
    feedback_id: feedback_id || null,
    workspace_id: workspace.id,
    display_order: newDisplayOrder,
    priority_score: priorityScore,
  })

  if (error) {
    console.error('Error creating roadmap item:', error)
    return { error: 'Failed to create roadmap item' }
  }

  revalidatePath('/roadmap')
  return { success: true }
}

// Priority score calculation based on votes and recency
const calculatePriorityScore = (voteCount: number, createdAt: Date): number => {
  const now = new Date()
  const ageInDays = Math.max(1, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  // Wilson score approximation + recency boost
  // Higher votes = higher score, newer items get slight boost
  const voteScore = voteCount * 10
  const recencyBoost = Math.max(0, 100 - ageInDays) / 10

  return Math.round(voteScore + recencyBoost)
}

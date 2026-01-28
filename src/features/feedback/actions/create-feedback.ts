'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createFeedbackSchema } from '@/lib/validations/feedback'
import { logger } from '@/lib/logger'

export type CreateFeedbackState = {
  error?: string
  success?: boolean
  fieldErrors?: {
    title?: string[]
    description?: string[]
    category?: string[]
  }
} | null

export const createFeedback = async (
  _prevState: CreateFeedbackState,
  formData: FormData
): Promise<CreateFeedbackState> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to submit feedback' }
  }

  // Parse and validate form data
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
  }

  const validationResult = createFeedbackSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: 'Please fix the errors below',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const { title, description, category } = validationResult.data

  // Get workspace ID (for now, use the first workspace or create default)
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .limit(1)
    .single()

  if (!workspace) {
    return { error: 'No workspace found. Please contact support.' }
  }

  // Insert feedback
  const { error } = await supabase.from('feedback').insert({
    title,
    description,
    category,
    author_id: user.id,
    workspace_id: workspace.id,
    status: 'open',
    vote_count: 0,
    comment_count: 0,
  })

  if (error) {
    logger.error('Failed to create feedback', { action: 'createFeedback', userId: user.id, category }, error)
    return { error: 'Failed to create feedback. Please try again.' }
  }

  revalidatePath('/feedback')
  return { success: true }
}

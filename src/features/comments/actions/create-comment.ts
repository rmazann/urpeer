'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCommentSchema } from '@/lib/validations/comment'

export type CreateCommentState = {
  error?: string
  success?: boolean
  fieldErrors?: {
    content?: string[]
  }
} | null

export const createComment = async (
  feedbackId: string,
  _prevState: CreateCommentState,
  formData: FormData
): Promise<CreateCommentState> => {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to comment' }
  }

  // Parse and validate form data
  const rawData = {
    content: formData.get('content'),
  }

  const validationResult = createCommentSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: 'Please fix the errors below',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const { content } = validationResult.data

  // Insert comment
  const { error } = await supabase.from('comments').insert({
    content,
    feedback_id: feedbackId,
    author_id: user.id,
  })

  if (error) {
    console.error('Error creating comment:', error)
    return { error: 'Failed to create comment. Please try again.' }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}

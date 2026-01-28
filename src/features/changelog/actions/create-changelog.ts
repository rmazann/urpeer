'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createChangelogSchema } from '@/lib/validations/changelog'

export type CreateChangelogState = {
  error?: string
  success?: boolean
  entryId?: string
  fieldErrors?: {
    title?: string[]
    content?: string[]
    category?: string[]
  }
} | null

export const createChangelogEntry = async (
  _prevState: CreateChangelogState,
  formData: FormData
): Promise<CreateChangelogState> => {
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
    return { error: 'Only admins can create changelog entries' }
  }

  // Parse and validate form data
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category'),
  }

  const validationResult = createChangelogSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: 'Please fix the errors below',
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const { title, content, category } = validationResult.data

  // Get workspace ID
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .limit(1)
    .single()

  if (!workspace) {
    return { error: 'No workspace found' }
  }

  // Insert changelog entry (as draft)
  const { data: entry, error } = await supabase
    .from('changelog_entries')
    .insert({
      title,
      content,
      category,
      author_id: user.id,
      workspace_id: workspace.id,
      published: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating changelog entry:', error)
    return { error: 'Failed to create changelog entry' }
  }

  revalidatePath('/changelog')
  revalidatePath('/admin/changelog')
  return { success: true, entryId: entry.id }
}

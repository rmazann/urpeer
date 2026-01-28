'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export type CreateWorkspaceInput = {
  name: string
  slug: string
  website?: string
}

export type CreateWorkspaceResult = {
  success: boolean
  error?: string
  workspaceId?: string
}

export const createWorkspace = async (
  input: CreateWorkspaceInput
): Promise<CreateWorkspaceResult> => {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    // Ensure profile exists (trigger might not have run)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      logger.info('Profile not found, creating...', { action: 'createWorkspace', userId: user.id })

      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          role: 'voter',
        })

      if (createProfileError) {
        logger.error('Failed to create profile', { action: 'createWorkspace', userId: user.id }, createProfileError)
        return { success: false, error: 'Failed to create your profile. Please contact support.' }
      }
    }

    // Validate input
  if (!input.name || input.name.length < 2) {
    return { success: false, error: 'Workspace name must be at least 2 characters' }
  }

  if (!input.slug || input.slug.length < 3) {
    return { success: false, error: 'Subdomain must be at least 3 characters' }
  }

  // Check if slug is available
  const { data: existingWorkspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', input.slug)
    .single()

  if (existingWorkspace) {
    return { success: false, error: 'This subdomain is already taken' }
  }

  // Create workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name: input.name,
      slug: input.slug,
      website: input.website || null,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (workspaceError) {
    logger.error('Failed to create workspace', { action: 'createWorkspace', userId: user.id }, workspaceError)
    return { success: false, error: 'Failed to create workspace' }
  }

  // Update user profile with workspace_id and make them admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      workspace_id: workspace.id,
      role: 'admin',
    })
    .eq('id', user.id)

  if (profileError) {
    logger.error('Failed to update profile with workspace', { action: 'createWorkspace', userId: user.id, workspaceId: workspace.id }, profileError)

    // Try upsert as fallback - profile might not exist
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        workspace_id: workspace.id,
        role: 'admin',
      })

    if (upsertError) {
      logger.error('Failed to upsert profile', { action: 'createWorkspace', userId: user.id, workspaceId: workspace.id }, upsertError)
      return { success: false, error: 'Failed to setup your profile. Please try again.' }
    }
  }

  revalidatePath('/')
  return { success: true, workspaceId: workspace.id }
  } catch (error) {
    logger.error('Unexpected error in createWorkspace', { action: 'createWorkspace' }, error as Error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export type CheckSlugResult = {
  available: boolean
}

export const checkSlugAvailability = async (slug: string): Promise<CheckSlugResult> => {
  const supabase = await createClient()

  // Validate slug format
  const sanitizedSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')

  if (sanitizedSlug.length < 3) {
    return { available: false }
  }

  // Reserved slugs
  const reservedSlugs = ['admin', 'api', 'www', 'app', 'dashboard', 'help', 'support', 'feedback', 'roadmap', 'changelog']
  if (reservedSlugs.includes(sanitizedSlug)) {
    return { available: false }
  }

  const { data: existingWorkspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', sanitizedSlug)
    .single()

  return { available: !existingWorkspace }
}

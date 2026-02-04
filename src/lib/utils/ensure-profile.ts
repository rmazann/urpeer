import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

type EnsureProfileResult = {
  success: boolean
  error?: string
}

/**
 * Ensures that a profile exists for the given user.
 * If the profile doesn't exist, it creates one idempotently.
 *
 * This is a defensive measure against profile creation failures during signup.
 * Call this function at critical points (onboarding, first interaction, etc.)
 *
 * @param userId - The auth user ID
 * @param email - User's email (optional, will fetch from auth if not provided)
 * @param fullName - User's full name (optional, will use email if not provided)
 * @returns Promise<EnsureProfileResult>
 */
export const ensureProfileExists = async (
  userId: string,
  email?: string,
  fullName?: string
): Promise<EnsureProfileResult> => {
  try {
    const supabase = await createClient()

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      logger.error('Failed to check profile existence', {
        action: 'ensureProfileExists',
        userId,
      }, fetchError)
      return { success: false, error: 'Failed to verify profile' }
    }

    // Profile exists, nothing to do
    if (existingProfile) {
      return { success: true }
    }

    // Profile doesn't exist, create it
    logger.info('Profile not found, creating...', {
      action: 'ensureProfileExists',
      userId,
    })

    // Fetch user data if not provided
    if (!email || !fullName) {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      email = email || user.email || ''
      fullName = fullName || user.user_metadata?.full_name || user.email || ''
    }

    // Create profile
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'voter',
      })

    if (createError) {
      // Check if it's a duplicate key error (profile was created by another process)
      if (createError.code === '23505') {
        logger.info('Profile already exists (race condition)', {
          action: 'ensureProfileExists',
          userId,
        })
        return { success: true }
      }

      logger.error('Failed to create profile', {
        action: 'ensureProfileExists',
        userId,
      }, createError)
      return { success: false, error: 'Failed to create profile' }
    }

    logger.info('Profile created successfully', {
      action: 'ensureProfileExists',
      userId,
    })

    return { success: true }
  } catch (error) {
    logger.error('Unexpected error in ensureProfileExists', {
      action: 'ensureProfileExists',
      userId,
    }, error as Error)
    return { success: false, error: 'Unexpected error' }
  }
}

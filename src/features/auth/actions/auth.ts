'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type AuthState = {
  error?: string
  success?: boolean
} | null

export const signup = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  }

  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { error: firstError?.message || 'Validation failed' }
  }

  const { email, password, fullName } = result.data

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create account' }
  }

  // Create profile for the new user
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email,
    full_name: fullName,
    role: 'voter',
  })

  if (profileError) {
    logger.error('Failed to create profile during signup', {
      action: 'signup',
      userId: authData.user.id,
    }, profileError)
    // Don't fail signup if profile creation fails
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export const login = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(rawData)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { error: firstError?.message || 'Validation failed' }
  }

  const { email, password } = result.data

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user has completed onboarding (has a workspace)
  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('workspace_id')
      .eq('id', authData.user.id)
      .single()

    revalidatePath('/', 'layout')

    // If no workspace, redirect to onboarding
    if (!profile?.workspace_id) {
      redirect('/onboarding')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feedback')
}

export const logout = async (): Promise<void> => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

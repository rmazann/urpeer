import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/supabase/types'

export const getUser = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (): Promise<Profile | null> => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export const requireAuth = async () => {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export const requireProfile = async () => {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return profile
}

export const isAdmin = async (): Promise<boolean> => {
  const profile = await getProfile()
  return profile?.role === 'admin'
}

export const requireAdmin = async () => {
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/feedback')
  }
  return profile
}

export const getUserWithProfile = async () => {
  const user = await getUser()
  if (!user) return { user: null, profile: null }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

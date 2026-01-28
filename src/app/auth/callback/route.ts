import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, workspace_id')
        .eq('id', data.user.id)
        .single()

      // If no profile exists, create one from OAuth metadata
      if (!existingProfile) {
        const userMetadata = data.user.user_metadata
        const fullName =
          userMetadata?.full_name ||
          userMetadata?.name ||
          userMetadata?.user_name ||
          data.user.email?.split('@')[0] ||
          'User'

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'voter',
          avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
        })

        if (profileError) {
          logger.error('Failed to create profile for OAuth user', { action: 'authCallback', userId: data.user.id }, profileError)
        }

        // New user goes to onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Existing user with workspace goes to feedback
      if (existingProfile.workspace_id) {
        return NextResponse.redirect(`${origin}/feedback`)
      }

      // Existing user without workspace goes to onboarding
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // Return to login page with error if code exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

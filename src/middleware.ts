import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase environment variables', {
      action: 'middleware',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect onboarding route - must be logged in
  if (request.nextUrl.pathname === '/onboarding') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Check if logged-in user needs to complete onboarding
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('workspace_id, role')
      .eq('id', user.id)
      .single()

    // If user has no workspace and not on excluded routes, redirect to onboarding
    const excludedPaths = ['/onboarding', '/login', '/signup', '/api', '/auth']
    const isExcludedPath = excludedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (!profile?.workspace_id && !isExcludedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/feedback'
        return NextResponse.redirect(url)
      }
    }
  }

  // Protect admin routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protect profile route
  if (request.nextUrl.pathname === '/profile' && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

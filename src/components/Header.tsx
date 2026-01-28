import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/actions/auth'
import { Button } from '@/components/ui/button'
import { MobileMenu } from '@/components/MobileMenu'
import Link from 'next/link'

export const Header = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Urpeer
          </Link>
          <nav className="hidden md:flex md:gap-4" aria-label="Main navigation">
            <Link
              href="/feedback"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Feedback
            </Link>
            <Link
              href="/roadmap"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Roadmap
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Changelog
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {profile?.full_name || user.email}
              </Link>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileMenu
          isAdmin={isAdmin}
          isLoggedIn={!!user}
          userName={profile?.full_name || undefined}
        />
      </div>
    </header>
  )
}

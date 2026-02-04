import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Rss } from 'lucide-react'

const MarketingHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Urpeer
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

const MarketingFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold">
              Urpeer
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Centralized feedback platform for building better products together.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback Board
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/api/changelog/rss"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  target="_blank"
                >
                  <Rss className="h-3 w-3" />
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Urpeer. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}

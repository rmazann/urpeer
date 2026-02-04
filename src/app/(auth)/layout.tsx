import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-block text-2xl font-bold">
              Urpeer
            </Link>
          </div>
          {children}
        </div>
      </div>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="hidden sm:inline">·</span>
          <span>Privacy Policy</span>
          <span className="hidden sm:inline">·</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  )
}

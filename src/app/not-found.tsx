import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
        moved or deleted.
      </p>
      <div className="flex gap-4 mt-8">
        <Button variant="outline" asChild>
          <Link href="javascript:history.back()">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

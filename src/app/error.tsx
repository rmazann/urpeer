'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-semibold mt-4">Something went wrong</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-2">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
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

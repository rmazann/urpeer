'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-4xl font-bold text-destructive">Something went wrong!</h1>
            <p className="text-muted-foreground max-w-md">
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
            <Button onClick={reset} variant="default">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

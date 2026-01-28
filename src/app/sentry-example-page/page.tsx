'use client'

import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SentryExamplePage() {
  const [isLoading, setIsLoading] = useState(false)

  const triggerClientError = () => {
    throw new Error('Sentry Example Frontend Error - Test from client side')
  }

  const triggerSentryCapture = () => {
    setIsLoading(true)
    try {
      Sentry.captureMessage('Test message from Sentry Example Page', 'info')
      Sentry.captureException(
        new Error('Sentry Example - Manually captured exception')
      )
      alert('Sentry events sent! Check your Sentry dashboard.')
    } finally {
      setIsLoading(false)
    }
  }

  const triggerApiError = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sentry-example-api')
      const data = await response.json()
      alert(data.message || 'API error triggered!')
    } catch {
      alert('API error occurred - check Sentry dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Sentry Test Page</CardTitle>
          <CardDescription>
            Bu sayfa Sentry entegrasyonunuzu test etmek icin kullanilir.
            Asagidaki butonlara tiklayarak farkli hata turlerini tetikleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">1. Client-Side Error</h3>
            <p className="text-xs text-muted-foreground">
              Tarayicida bir JavaScript hatasi firlatir.
            </p>
            <Button
              variant="destructive"
              onClick={triggerClientError}
              className="w-full"
            >
              Trigger Client Error
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">2. Manual Capture</h3>
            <p className="text-xs text-muted-foreground">
              Sentry.captureException ile manuel olarak hata gonderir.
            </p>
            <Button
              variant="outline"
              onClick={triggerSentryCapture}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Manual Event'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm">3. API Route Error</h3>
            <p className="text-xs text-muted-foreground">
              Server-side API route hatasi tetikler.
            </p>
            <Button
              variant="secondary"
              onClick={triggerApiError}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Trigger API Error'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Not:</strong> Sentry sadece production modunda aktif.
              Development modunda hatalar konsola yazdirilir ancak Sentry&apos;ye
              gonderilmez. Production&apos;da test etmek icin{' '}
              <code className="bg-background px-1 rounded">npm run build && npm start</code>{' '}
              komutunu kullanin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

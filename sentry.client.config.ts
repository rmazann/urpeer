import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production

  // Session Replay (optional)
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',

  // Environment
  environment: process.env.NODE_ENV,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Ignore common non-critical errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // User actions
    'ResizeObserver loop limit exceeded',
  ],

  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive query parameters
    if (event.request?.query_string) {
      const params = new URLSearchParams(event.request.query_string)
      params.delete('token')
      params.delete('code')
      params.delete('session')
      event.request.query_string = params.toString()
    }
    return event
  },
})

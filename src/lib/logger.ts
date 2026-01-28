/**
 * Structured logging utility for Urpeer.com
 *
 * Usage:
 * - Development: Logs to console with colors and context
 * - Production: Sends errors to Sentry for monitoring
 *
 * DO NOT use console.log/error directly in application code.
 * Use this logger instead for proper error tracking and monitoring.
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

type LogContext = {
  action?: string
  userId?: string
  feedbackId?: string
  workspaceId?: string
  [key: string]: string | number | boolean | undefined
}

type LogEntry = {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error | unknown
  timestamp: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Format log entry for console output
 */
const formatConsoleLog = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toISOString()
  const level = entry.level.toUpperCase().padEnd(5)
  const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
  const error = entry.error instanceof Error
    ? `\n  Error: ${entry.error.message}\n  Stack: ${entry.error.stack}`
    : entry.error
    ? `\n  ${JSON.stringify(entry.error)}`
    : ''

  return `[${timestamp}] ${level} | ${entry.message}${context}${error}`
}

/**
 * Send log to Sentry for error tracking
 */
const sendToSentry = (entry: LogEntry): void => {
  const sentryContext = {
    level: entry.level as Sentry.SeverityLevel,
    extra: {
      ...entry.context,
      timestamp: entry.timestamp,
    },
  }

  if (entry.error instanceof Error) {
    Sentry.captureException(entry.error, sentryContext)
  } else if (entry.error) {
    Sentry.captureMessage(entry.message, {
      ...sentryContext,
      extra: {
        ...sentryContext.extra,
        errorDetails: entry.error,
      },
    })
  } else {
    Sentry.captureMessage(entry.message, sentryContext)
  }
}

/**
 * Core logging function
 */
const log = (level: LogLevel, message: string, context?: LogContext, error?: Error | unknown): void => {
  const entry: LogEntry = {
    level,
    message,
    context,
    error,
    timestamp: new Date().toISOString(),
  }

  // In development, always log to console
  if (isDevelopment) {
    const formatted = formatConsoleLog(entry)

    switch (level) {
      case 'error':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'debug':
        console.debug(formatted)
        break
    }
  }

  // In production, send errors and warnings to Sentry
  if (!isDevelopment && (level === 'error' || level === 'warn')) {
    sendToSentry(entry)
  }
}

/**
 * Logger instance with typed methods
 */
export const logger = {
  info: (message: string, context?: LogContext) => {
    log('info', message, context)
  },

  warn: (message: string, context?: LogContext) => {
    log('warn', message, context)
  },

  error: (message: string, context?: LogContext, error?: Error | unknown) => {
    log('error', message, context, error)
  },

  debug: (message: string, context?: LogContext) => {
    log('debug', message, context)
  },
}

/**
 * Helper to create scoped logger with default context
 * Useful for adding consistent context to all logs in a module
 */
export const createScopedLogger = (defaultContext: LogContext) => ({
  info: (message: string, context?: LogContext) =>
    logger.info(message, { ...defaultContext, ...context }),

  warn: (message: string, context?: LogContext) =>
    logger.warn(message, { ...defaultContext, ...context }),

  error: (message: string, context?: LogContext, error?: Error | unknown) =>
    logger.error(message, { ...defaultContext, ...context }, error),

  debug: (message: string, context?: LogContext) =>
    logger.debug(message, { ...defaultContext, ...context }),
})

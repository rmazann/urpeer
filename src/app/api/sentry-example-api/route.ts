import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Intentionally throw an error for testing
    throw new Error('Sentry Example API Error - Test from server side')
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error)

    return NextResponse.json(
      { message: 'API error triggered and sent to Sentry!' },
      { status: 500 }
    )
  }
}

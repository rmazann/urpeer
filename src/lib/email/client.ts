import { Resend } from 'resend'
import { logger } from '@/lib/logger'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  logger.warn('RESEND_API_KEY is not set. Email functionality will be disabled.')
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@urpeer.com'
export const FROM_NAME = process.env.FROM_NAME || 'Urpeer'

export const getFromAddress = () => `${FROM_NAME} <${FROM_EMAIL}>`

export const isEmailEnabled = () => resend !== null

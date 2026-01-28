/**
 * Email Test Script
 * Run with: npx tsx scripts/test-email.ts
 */

import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.error('RESEND_API_KEY is not set in environment')
  process.exit(1)
}

const resend = new Resend(resendApiKey)

async function testEmail() {
  console.log('Testing Resend email integration...\n')

  try {
    // Send a test email
    console.log('1. Sending test email...')
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Urpeer <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // Resend's test inbox
      subject: 'Urpeer Email Test',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from Urpeer.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    })

    if (emailError) {
      console.error('   Failed to send test email:', emailError)
      return
    }

    console.log('   Test email sent successfully!')
    console.log(`   Email ID: ${emailResult?.id}`)

    console.log('\n--- Email System Test PASSED ---')
    console.log('\nNext steps:')
    console.log('1. Verify your domain in Resend dashboard for production emails')
    console.log('2. Update FROM_EMAIL in .env.local to your verified domain')
    console.log('3. Test email templates in development with real addresses')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testEmail()

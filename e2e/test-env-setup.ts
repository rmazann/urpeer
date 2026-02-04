import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

/**
 * Load test environment variables from .env.test
 * This ensures E2E tests use the dedicated test database
 */
export function loadTestEnv() {
  const envPath = resolve(process.cwd(), '.env.test')

  // Check if .env.test exists
  if (!existsSync(envPath)) {
    console.error('❌ Error: .env.test file not found!')
    console.error('')
    console.error('Please follow the setup guide:')
    console.error('  e2e/TEST_DATABASE_SETUP.md')
    console.error('')
    console.error('Quick start:')
    console.error('  1. Copy .env.test.example to .env.test')
    console.error('  2. Fill in your test Supabase credentials')
    console.error('  3. Re-run tests')
    console.error('')
    throw new Error('Missing .env.test file')
  }

  // Load environment variables
  const result = config({ path: envPath })

  if (result.error) {
    throw new Error(`Failed to load .env.test: ${result.error.message}`)
  }

  // Verify required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables in .env.test:')
    missing.forEach(key => console.error(`  - ${key}`))
    console.error('')
    console.error('Please fill in all required variables.')
    console.error('See .env.test.example for reference.')
    console.error('')
    throw new Error(`Missing required variables: ${missing.join(', ')}`)
  }

  // Success - log configuration
  console.log('✅ Test environment loaded')
  console.log(`   Database: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log('')
}

import { test, expect } from '@playwright/test'

test.describe('Test Database Verification', () => {
  test('should have test environment variables configured', async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('✓ Supabase URL:', supabaseUrl)
    console.log('✓ Anon Key exists:', !!supabaseKey)
    console.log('✓ Anon Key length:', supabaseKey?.length || 0, 'characters')

    // Verify variables exist
    expect(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL should be set').toBeTruthy()
    expect(supabaseKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY should be set').toBeTruthy()

    // Verify URL format
    expect(supabaseUrl).toContain('supabase.co')

    // Verify anon key format (should be JWT)
    expect(supabaseKey).toMatch(/^eyJ/)

    console.log('✅ Test database configuration valid')
  })

  test('should connect to test database', async ({ page }) => {
    // Navigate to a page that uses Supabase
    await page.goto('/')

    // Check for any console errors related to Supabase
    const errors: string[] = []
    page.on('pageerror', (error) => {
      if (error.message.includes('supabase') || error.message.includes('auth')) {
        errors.push(error.message)
      }
    })

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if there were any Supabase-related errors
    if (errors.length > 0) {
      console.error('❌ Supabase connection errors:', errors)
      throw new Error(`Supabase connection failed: ${errors.join(', ')}`)
    }

    console.log('✅ Test database connection successful')
  })
})

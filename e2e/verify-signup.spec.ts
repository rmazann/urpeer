import { test, expect } from '@playwright/test'
import { signUpAndOnboard } from './helpers/auth'

test.describe('Test Database Signup Verification', () => {
  test('should create user without rate limit errors', async ({ page }) => {
    console.log('Testing user creation in test database...')

    // Listen for any error toasts
    const toasts: Array<{ type: string; text: string }> = []
    page.on('console', (msg) => {
      if (msg.text().includes('rate limit')) {
        console.error('❌ Rate limit detected:', msg.text())
      }
    })

    // Attempt to create user
    const result = await signUpAndOnboard(page)

    console.log('✅ User created:', result.user.email)
    console.log('✅ Workspace created:', result.workspace.slug)

    // Verify we're on feedback page (signup succeeded)
    await expect(page).toHaveURL('/feedback')

    // Check for error toasts
    await page.waitForTimeout(1000)
    const errorToasts = await page.locator('[data-sonner-toast][data-type="error"]').all()

    if (errorToasts.length > 0) {
      const errorTexts = await Promise.all(errorToasts.map(t => t.textContent()))
      console.error('❌ Error toasts found:', errorTexts)

      if (errorTexts.some(text => text?.includes('rate limit'))) {
        throw new Error('Rate limit error detected! Check test database auth settings.')
      }
    }

    console.log('✅ Full signup flow works without rate limits!')
  })

  test('should create multiple users quickly (rate limit stress test)', async ({ page }) => {
    console.log('Creating 3 users rapidly to test rate limits...')

    for (let i = 1; i <= 3; i++) {
      console.log(`Creating user ${i}/3...`)

      const result = await signUpAndOnboard(page, {
        email: `stress-test-${Date.now()}-${i}@example.com`,
        workspaceSlug: `stress-test-${Date.now()}-${i}`
      })

      await expect(page).toHaveURL('/feedback')
      console.log(`✅ User ${i}/3 created:`, result.user.email)

      // Small delay to allow for cleanup
      await page.waitForTimeout(500)

      // Logout for next user
      await page.goto('/signup')
    }

    console.log('✅ All 3 users created successfully - no rate limiting!')
  })
})

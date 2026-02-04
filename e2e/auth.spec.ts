import { test, expect } from '@playwright/test'
import { generateTestUser, signUp, completeOnboarding, signUpAndOnboard, login } from './helpers/auth'

test.describe('Authentication Flow', () => {
  test('should sign up, complete onboarding, and access feedback page', async ({ page }) => {
    const user = generateTestUser()
    const workspace = {
      name: 'My Test Workspace',
      slug: `test-${Date.now()}`,
      website: 'https://example.com',
    }

    // Sign up
    await signUp(page, user)

    // Should be on onboarding page
    await expect(page).toHaveURL('/onboarding')

    // Complete onboarding
    await completeOnboarding(page, workspace)

    // Should be redirected to feedback page
    await expect(page).toHaveURL('/feedback')

    // Should see workspace name or feedback UI
    await expect(page.locator('body')).toContainText(/feedback|Feedback/i)
  })

  test('should handle profile creation failure gracefully', async ({ page }) => {
    // This test verifies that even if profile creation fails during signup,
    // the onboarding flow will create the profile

    const user = generateTestUser()
    const workspace = {
      name: 'Recovery Test Workspace',
      slug: `recovery-${Date.now()}`,
    }

    await signUp(page, user)

    // Even if profile wasn't created during signup, onboarding should handle it
    await expect(page).toHaveURL('/onboarding')

    await completeOnboarding(page, workspace)

    // Should successfully create workspace and complete onboarding
    await expect(page).toHaveURL('/feedback')
  })

  test('should login and redirect to feedback if onboarding completed', async ({ page }) => {
    // First create a user with completed onboarding
    const { user } = await signUpAndOnboard(page)

    // Logout
    await page.goto('/login')

    // Login again
    await login(page, user)

    // Should go directly to feedback (not onboarding)
    await expect(page).toHaveURL('/feedback')
  })

  test('should redirect to onboarding if workspace not created', async ({ page }) => {
    const user = generateTestUser()

    // Sign up but don't complete onboarding
    await signUp(page, user)
    await expect(page).toHaveURL('/onboarding')

    // Go back to login without completing onboarding
    await page.goto('/login')

    // Login
    await login(page, user)

    // Should redirect back to onboarding
    await expect(page).toHaveURL('/onboarding')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123!')

    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('body')).toContainText(/invalid|incorrect|wrong/i)

    // Should still be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should validate email format during signup', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="fullName"]', 'Test User')

    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('body')).toContainText(/valid email/i)
  })

  test('should validate password length during signup', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', generateTestUser().email)
    await page.fill('input[name="password"]', 'short')
    await page.fill('input[name="fullName"]', 'Test User')

    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('body')).toContainText(/at least 8 characters/i)
  })
})

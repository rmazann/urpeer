import { Page } from '@playwright/test'

/**
 * Fixed test user credentials
 * Uses a pre-created user to avoid Supabase email rate limits
 */
export const TEST_USER = {
  email: 'ramazanntutar@gmail.com',
  password: '12345678',
  fullName: 'Ramazan Tutar',
}

/**
 * Generate a unique test user email (for signup-specific tests only)
 * Uses Gmail + alias format to avoid Supabase email validation issues
 */
export const generateTestEmail = (prefix = 'test') => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `ramazanntutar+${prefix}-${timestamp}-${random}@gmail.com`
}

/**
 * Generate test user credentials
 */
export const generateTestUser = () => ({
  email: generateTestEmail(),
  password: 'TestPassword123!',
  fullName: 'Test User',
})

/**
 * Sign up a new user
 */
export const signUp = async (
  page: Page,
  user: { email: string; password: string; fullName: string }
) => {
  await page.goto('/signup')

  // Fill signup form
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[name="fullName"]', user.fullName)

  // Submit form by pressing Enter (more reliable than clicking button for server actions)
  await Promise.all([
    page.waitForURL('/onboarding', { timeout: 15000 }),
    page.locator('input[name="password"]').press('Enter')
  ])

  return user
}

/**
 * Complete onboarding flow (4-step wizard)
 */
export const completeOnboarding = async (
  page: Page,
  workspace: { name: string; slug: string; website?: string }
) => {
  // Should already be on /onboarding
  await page.waitForURL('/onboarding')

  // Step 1: Website (optional)
  if (workspace.website) {
    await page.fill('input[placeholder="mywebsite.com"]', workspace.website)
    // Click "Next" or it will auto-proceed
    await page.click('button:has-text("Skip")')
  } else {
    // Skip this step
    await page.click('button:has-text("Skip")')
  }

  // Step 2: Workspace name
  await page.fill('input[placeholder="My Workspace"]', workspace.name)
  await page.click('button:has-text("Next")')

  // Step 3: Subdomain/slug
  await page.fill('input[placeholder="my-workspace"]', workspace.slug)
  // Wait a bit for slug availability check
  await page.waitForTimeout(500)
  await page.click('button:has-text("Next")')

  // Step 4: Review and complete
  await page.click('button:has-text("Get Started")')

  // Wait for navigation to feedback page
  await page.waitForURL('/feedback', { timeout: 15000 })
}

/**
 * Login or sign up and complete onboarding
 * First tries to login with test user, falls back to signup if needed
 * This avoids Supabase email rate limits by reusing existing user
 */
export const signUpAndOnboard = async (
  page: Page,
  overrides?: {
    email?: string
    password?: string
    fullName?: string
    workspaceName?: string
    workspaceSlug?: string
  }
) => {
  // Use fixed test user to avoid rate limits
  const user = {
    email: overrides?.email || TEST_USER.email,
    password: overrides?.password || TEST_USER.password,
    fullName: overrides?.fullName || TEST_USER.fullName,
  }

  const workspace = {
    name: overrides?.workspaceName || 'Test Workspace',
    slug: overrides?.workspaceSlug || `test-${Date.now()}`,
  }

  // Try login first (to avoid rate limits)
  await page.goto('/login')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)

  // Submit and wait for response
  await page.evaluate(() => {
    document.querySelector('form')?.requestSubmit()
  })

  // Wait for navigation or error
  await page.waitForTimeout(3000)

  const currentUrl = page.url()

  if (currentUrl.includes('/feedback')) {
    // Already logged in and onboarded
    return { user, workspace }
  } else if (currentUrl.includes('/onboarding')) {
    // Logged in but needs onboarding
    await completeOnboarding(page, workspace)
    return { user, workspace }
  } else {
    // Login failed, try signup (will hit rate limit if too many attempts)
    await signUp(page, user)
    await completeOnboarding(page, workspace)
    return { user, workspace }
  }
}

/**
 * Login with existing user
 */
export const login = async (
  page: Page,
  credentials: { email: string; password: string }
) => {
  await page.goto('/login')

  await page.fill('input[name="email"]', credentials.email)
  await page.fill('input[name="password"]', credentials.password)

  // Submit form by pressing Enter (more reliable than clicking button for server actions)
  await Promise.all([
    page.waitForURL(/\/(feedback|onboarding)/, { timeout: 15000 }),
    page.locator('input[name="password"]').press('Enter')
  ])
}

/**
 * Logout
 */
export const logout = async (page: Page) => {
  // Find and click logout button (adjust selector based on your UI)
  await page.click('button:has-text("Logout"), a:has-text("Logout")')

  // Wait for redirect to login or home
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 })
}

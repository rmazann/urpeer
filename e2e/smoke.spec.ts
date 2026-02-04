import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage should load', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Urpeer|Home/)
    console.log('✅ Homepage loaded successfully')
  })

  test('signup page should load', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('h1, h2')).toContainText(/create|sign up/i)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="fullName"]')).toBeVisible()
    console.log('✅ Signup page loaded with all fields')
  })

  test('login page should load', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1, h2')).toContainText(/welcome|login|sign in/i)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    console.log('✅ Login page loaded with all fields')
  })

  test('feedback page should load', async ({ page }) => {
    await page.goto('/feedback')
    // Should either show feedback page or redirect to login
    await page.waitForLoadState('networkidle')
    const url = page.url()
    console.log(`✅ Feedback page loaded (URL: ${url})`)
  })
})

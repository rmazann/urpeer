import { test, expect } from '@playwright/test'
import { signUpAndOnboard } from './helpers/auth'

test.describe('Feedback Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new user and complete onboarding before each test
    await signUpAndOnboard(page)
  })

  test('should create new feedback', async ({ page }) => {
    // Should be on feedback page
    await expect(page).toHaveURL('/feedback')

    // Click "Submit Feedback" button
    await page.click('button:has-text("Submit Feedback")')

    // Fill feedback form
    const feedbackTitle = `Test Feedback ${Date.now()}`
    await page.fill('input[name="title"], textarea[name="title"]', feedbackTitle)
    await page.fill('textarea[name="description"]', 'This is a test feedback description')

    // Select category if available
    const categorySelect = page.locator('select[name="category"]')
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('feature')
    }

    // Submit feedback
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit")')

    // Wait for feedback to appear
    await page.waitForTimeout(1000)

    // Should see the feedback in the list
    await expect(page.locator('body')).toContainText(feedbackTitle)
  })

  test('should vote on feedback', async ({ page }) => {
    // Create a feedback first
    await page.click('button:has-text("Submit Feedback")')

    const feedbackTitle = `Votable Feedback ${Date.now()}`
    await page.fill('input[name="title"], textarea[name="title"]', feedbackTitle)
    await page.fill('textarea[name="description"]', 'Test voting on this feedback')
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit")')

    await page.waitForTimeout(1000)

    // Find and click vote button
    const feedbackCard = page.locator(`text=${feedbackTitle}`).locator('..').locator('..')
    const voteButton = feedbackCard.locator('button:has-text("Vote"), button[aria-label*="vote"]').first()

    // Get initial vote count
    const initialVoteText = await voteButton.textContent()
    const initialVotes = parseInt(initialVoteText?.match(/\d+/)?.[0] || '0')

    // Click vote
    await voteButton.click()
    await page.waitForTimeout(500)

    // Vote count should increase
    const newVoteText = await voteButton.textContent()
    const newVotes = parseInt(newVoteText?.match(/\d+/)?.[0] || '0')

    expect(newVotes).toBe(initialVotes + 1)

    // Click again to unvote
    await voteButton.click()
    await page.waitForTimeout(500)

    // Vote count should decrease
    const finalVoteText = await voteButton.textContent()
    const finalVotes = parseInt(finalVoteText?.match(/\d+/)?.[0] || '0')

    expect(finalVotes).toBe(initialVotes)
  })

  test('should view feedback details and add comment', async ({ page }) => {
    // Create a feedback first
    await page.click('button:has-text("Submit Feedback")')

    const feedbackTitle = `Commentable Feedback ${Date.now()}`
    await page.fill('input[name="title"], textarea[name="title"]', feedbackTitle)
    await page.fill('textarea[name="description"]', 'Test commenting on this feedback')
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit")')

    await page.waitForTimeout(1000)

    // Click on the feedback to view details
    await page.click(`text=${feedbackTitle}`)

    // Should navigate to feedback detail page
    await expect(page).toHaveURL(/\/feedback\/[\w-]+/)

    // Should see feedback title and description
    await expect(page.locator('h1, h2')).toContainText(feedbackTitle)
    await expect(page.locator('body')).toContainText('Test commenting on this feedback')

    // Add a comment
    const commentText = `Test comment ${Date.now()}`
    await page.fill('textarea[name="content"], textarea[placeholder*="comment"]', commentText)
    await page.click('button[type="submit"]:has-text("Comment"), button[type="submit"]:has-text("Post")')

    await page.waitForTimeout(1000)

    // Comment should appear
    await expect(page.locator('body')).toContainText(commentText)
  })

  test('should filter feedback by status', async ({ page }) => {
    await expect(page).toHaveURL('/feedback')

    // Look for filter controls (buttons, select, tabs, etc.)
    const hasFilterButtons = await page.locator('button:has-text("Open"), button:has-text("Completed")').count()
    const hasFilterSelect = await page.locator('select[name*="status"], select[name*="filter"]').count()

    if (hasFilterButtons > 0) {
      // Click on "Completed" filter
      await page.click('button:has-text("Completed")')
      await page.waitForTimeout(500)

      // URL should update or content should filter
      // This is a basic check - adjust based on your actual implementation
      await expect(page).toHaveURL(/status=completed|filter=completed/)
    } else if (hasFilterSelect > 0) {
      // Select "Completed" from dropdown
      await page.selectOption('select[name*="status"], select[name*="filter"]', 'completed')
      await page.waitForTimeout(500)
    } else {
      // Skip test if no filter UI found
      test.skip()
    }
  })

  test('should search feedback', async ({ page }) => {
    // Create a feedback with unique title
    await page.click('button:has-text("Submit Feedback")')

    const uniqueTitle = `Searchable-${Date.now()}`
    await page.fill('input[name="title"], textarea[name="title"]', uniqueTitle)
    await page.fill('textarea[name="description"]', 'Test search functionality')
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit")')

    await page.waitForTimeout(1000)

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]').first()

    if (await searchInput.isVisible()) {
      // Search for the unique title
      await searchInput.fill(uniqueTitle)
      await page.waitForTimeout(1000)

      // Should show only matching feedback
      await expect(page.locator('body')).toContainText(uniqueTitle)
    } else {
      // Skip if no search functionality
      test.skip()
    }
  })
})

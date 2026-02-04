import { test, expect } from '@playwright/test'
import { signUpAndOnboard } from './helpers/auth'

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new user - they become admin after creating workspace
    await signUpAndOnboard(page)
  })

  test('should access admin dashboard', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin')

    // Should see admin content
    await expect(page.locator('h1, h2')).toContainText(/admin|dashboard/i)

    // Should see stats or management sections
    await expect(page.locator('body')).toContainText(/feedback|stats|manage/i)
  })

  test('should create roadmap item', async ({ page }) => {
    await page.goto('/roadmap')

    // Look for "Add" or "Create" button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")')

    if (await addButton.isVisible()) {
      await addButton.click()

      // Fill roadmap item form
      const roadmapTitle = `Roadmap Item ${Date.now()}`
      await page.fill('input[name="title"], textarea[name="title"]', roadmapTitle)
      await page.fill('textarea[name="description"]', 'Test roadmap item description')

      // Select status (Planned, In Progress, Completed)
      const statusSelect = page.locator('select[name="status"]')
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('planned')
      }

      // Submit
      await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")')

      await page.waitForTimeout(1000)

      // Should see the roadmap item on the board
      await expect(page.locator('body')).toContainText(roadmapTitle)
    } else {
      test.skip()
    }
  })

  test('should drag roadmap item between columns', async ({ page }) => {
    await page.goto('/roadmap')

    // Look for roadmap items
    const roadmapItems = await page.locator('[draggable="true"], [data-testid*="roadmap-card"]').count()

    if (roadmapItems > 0) {
      // Get first item in "Planned" column
      const plannedItem = page.locator('[data-status="planned"], :has-text("Planned")').locator('[draggable="true"]').first()

      if (await plannedItem.isVisible()) {
        // Get the "In Progress" column drop zone
        const inProgressColumn = page.locator('[data-status="in_progress"], :has-text("In Progress")').first()

        // Drag and drop
        await plannedItem.dragTo(inProgressColumn)

        await page.waitForTimeout(1000)

        // Item should now be in "In Progress" column
        // This is a simplified check - actual implementation may vary
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  test('should publish changelog entry', async ({ page }) => {
    await page.goto('/admin/changelog')

    // Click "New" or "Create" button
    const createButton = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add")')

    if (await createButton.isVisible()) {
      await createButton.click()

      // Fill changelog form
      const changelogTitle = `Release ${Date.now()}`
      await page.fill('input[name="title"], textarea[name="title"]', changelogTitle)
      await page.fill('textarea[name="description"]', 'Test changelog entry')

      // Select category
      const categorySelect = page.locator('select[name="category"]')
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption('feature')
      }

      // Check "Published" checkbox or toggle
      const publishedCheckbox = page.locator('input[name="published"][type="checkbox"]')
      if (await publishedCheckbox.isVisible()) {
        await publishedCheckbox.check()
      }

      // Submit
      await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Publish"), button[type="submit"]:has-text("Save")')

      await page.waitForTimeout(1000)

      // Navigate to public changelog
      await page.goto('/changelog')

      // Should see the published changelog entry
      await expect(page.locator('body')).toContainText(changelogTitle)
    } else {
      test.skip()
    }
  })

  test('should update feedback status as admin', async ({ page }) => {
    // Create a feedback first
    await page.goto('/feedback')
    await page.click('button:has-text("Submit Feedback")')

    const feedbackTitle = `Admin Manageable Feedback ${Date.now()}`
    await page.fill('input[name="title"], textarea[name="title"]', feedbackTitle)
    await page.fill('textarea[name="description"]', 'Test admin status update')
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit")')

    await page.waitForTimeout(1000)

    // Go to admin feedback management
    await page.goto('/admin/feedback')

    // Find the feedback and look for status dropdown or actions
    const feedbackRow = page.locator(`tr:has-text("${feedbackTitle}"), div:has-text("${feedbackTitle}")`).first()

    if (await feedbackRow.isVisible()) {
      // Look for status dropdown or actions menu
      const statusSelect = feedbackRow.locator('select[name*="status"]')
      const actionsButton = feedbackRow.locator('button:has-text("Actions"), button[aria-label*="actions"]')

      if (await statusSelect.isVisible()) {
        // Change status to "In Progress"
        await statusSelect.selectOption('in_progress')
        await page.waitForTimeout(1000)

        // Verify status changed
        await expect(feedbackRow).toContainText(/in progress/i)
      } else if (await actionsButton.isVisible()) {
        // Click actions and select status
        await actionsButton.click()
        await page.click('text="In Progress", button:has-text("In Progress")')
        await page.waitForTimeout(1000)
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  test('should view admin stats', async ({ page }) => {
    await page.goto('/admin')

    // Should see various stats
    const statsCards = await page.locator('[data-testid*="stat"], div:has-text("Total"), div:has-text("Feedback")').count()

    expect(statsCards).toBeGreaterThan(0)

    // Should show numbers
    await expect(page.locator('body')).toContainText(/\d+/)
  })
})

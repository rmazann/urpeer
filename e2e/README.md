# E2E Testing with Playwright

This directory contains end-to-end tests for Urpeer.com using Playwright.

## Test Structure

```
e2e/
├── helpers/
│   └── auth.ts          # Authentication helpers (signup, login, etc.)
├── auth.spec.ts         # Authentication flow tests
├── feedback.spec.ts     # Feedback CRUD and voting tests
├── admin.spec.ts        # Admin features (roadmap, changelog, etc.)
└── README.md
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

3. Ensure your `.env.local` file has valid Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

### Run Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

### Run Specific Test Files

```bash
# Run only auth tests
npx playwright test auth.spec.ts

# Run only feedback tests
npx playwright test feedback.spec.ts

# Run only admin tests
npx playwright test admin.spec.ts
```

### Run Specific Test Cases

```bash
# Run a specific test by name
npx playwright test -g "should sign up and complete onboarding"

# Run tests matching a pattern
npx playwright test -g "should create"
```

## Test Coverage

### Authentication Flow (auth.spec.ts)
- ✅ Sign up, complete onboarding, access feedback
- ✅ Profile creation failure recovery
- ✅ Login and redirect based on onboarding status
- ✅ Invalid credentials error handling
- ✅ Email and password validation

### Feedback Flow (feedback.spec.ts)
- ✅ Create new feedback
- ✅ Vote and unvote on feedback
- ✅ View feedback details and add comments
- ✅ Filter feedback by status
- ✅ Search feedback

### Admin Flow (admin.spec.ts)
- ✅ Access admin dashboard
- ✅ Create roadmap items
- ✅ Drag roadmap items between columns
- ✅ Publish changelog entries
- ✅ Update feedback status as admin
- ✅ View admin statistics

## Test Helpers

### Auth Helpers (e2e/helpers/auth.ts)

#### `generateTestUser()`
Generates unique test user credentials:
```typescript
const user = generateTestUser()
// { email: 'test-1234567890-abc123@example.com', password: 'TestPassword123!', fullName: 'Test User' }
```

#### `signUp(page, user)`
Signs up a new user:
```typescript
const user = generateTestUser()
await signUp(page, user)
// User is now signed up and on /onboarding page
```

#### `completeOnboarding(page, workspace)`
Completes onboarding flow:
```typescript
await completeOnboarding(page, {
  name: 'My Workspace',
  slug: 'my-workspace-123',
  website: 'https://example.com'
})
// User is now on /feedback page with workspace created
```

#### `signUpAndOnboard(page, overrides?)`
One-step signup + onboarding:
```typescript
const { user, workspace } = await signUpAndOnboard(page)
// User is fully set up and ready to use the app
```

#### `login(page, credentials)`
Login with existing user:
```typescript
await login(page, { email: 'user@example.com', password: 'password' })
```

## Writing New Tests

### Example: Testing a New Feature

```typescript
import { test, expect } from '@playwright/test'
import { signUpAndOnboard } from './helpers/auth'

test.describe('My New Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated user
    await signUpAndOnboard(page)
  })

  test('should do something awesome', async ({ page }) => {
    // Navigate to feature
    await page.goto('/my-feature')

    // Interact with UI
    await page.click('button:has-text("Click Me")')

    // Assert expected behavior
    await expect(page.locator('.result')).toContainText('Success!')
  })
})
```

## Best Practices

### 1. Use Unique Identifiers
Always use timestamps or random strings for test data:
```typescript
const title = `Test Feedback ${Date.now()}`
```

### 2. Wait for Actions to Complete
Use appropriate waits after actions:
```typescript
await page.click('button[type="submit"]')
await page.waitForTimeout(1000) // Wait for API call
```

### 3. Use Flexible Selectors
Prefer text-based or semantic selectors:
```typescript
// Good
await page.click('button:has-text("Submit")')

// Less good (brittle)
await page.click('#submit-btn-123')
```

### 4. Skip Tests Gracefully
If a feature isn't available, skip the test:
```typescript
if (!(await element.isVisible())) {
  test.skip()
}
```

### 5. Clean Up After Tests
Tests should be independent and not rely on shared state:
```typescript
test.beforeEach(async ({ page }) => {
  // Fresh user for each test
  await signUpAndOnboard(page)
})
```

## Debugging Failed Tests

### 1. Run in Headed Mode
See what's happening in the browser:
```bash
npm run test:e2e:headed
```

### 2. Use Debug Mode
Step through test execution:
```bash
npm run test:e2e:debug
```

### 3. View Trace
Playwright captures traces on failure:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### 4. Check Screenshots
Screenshots are taken on failure (in `test-results/`)

### 5. View Video
Videos are recorded on failure (in `test-results/`)

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

See `.github/workflows/e2e-tests.yml` for configuration.

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running properly
- Verify Supabase connection

### Flaky Tests
- Add explicit waits after actions
- Use `page.waitForLoadState('networkidle')`
- Check for race conditions

### Selectors Not Found
- Verify UI hasn't changed
- Use more flexible selectors
- Add data-testid attributes to components

## Test Execution Log

### Run: [DATE] - TEMPLATE
*Fill this in after running tests*

- **Environment:** Local (macOS, Chromium) / CI
- **Results:** [X]/22 passed ([Y]%)
- **Execution Time:** [Z] minutes
- **Issues Found:**
  - [List any failures with brief explanation]
- **Notes:** [Any observations about test stability, performance, etc.]

---

### Example Entry

**Run: 2026-01-29 11:00 AM**
- **Environment:** Local (macOS, Chromium)
- **Results:** 19/22 passed (86%)
- **Execution Time:** 8.5 minutes
- **Issues Found:**
  - `feedback.spec.ts` - "should search feedback" - Feature not implemented, test skipped gracefully
  - `feedback.spec.ts` - "should filter feedback by status" - UI selector changed, needs update
  - `admin.spec.ts` - "should drag roadmap item" - Drag-and-drop not working, known Playwright issue
- **Notes:**
  - All critical paths (auth, feedback CRUD, admin access) working
  - Test execution stable, no flakiness observed
  - Created ~20 test users in Supabase

---

## Detailed Troubleshooting Guide

### Problem: All Tests Timeout
**Symptoms:** Every test times out at 30s mark

**Diagnosis Steps:**
1. Check if dev server running: `curl http://localhost:3000`
2. Check port 3000 status: `lsof -i:3000`
3. Review Playwright config `webServer` settings

**Solutions:**
- **Restart dev server:** `lsof -ti:3000 | xargs kill -9 && npm run dev`
- **Increase global timeout:** Edit `playwright.config.ts`, set `timeout: 60000`
- **Check for build errors:** Review dev server console output

---

### Problem: Supabase Connection Errors
**Symptoms:** Tests fail with "Failed to fetch" or auth errors

**Diagnosis Steps:**
1. Verify env vars: `grep SUPABASE .env.local`
2. Test connection: Open Supabase dashboard, check project status
3. Check RLS policies aren't blocking test operations

**Solutions:**
- **Verify credentials:** Ensure `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Check Supabase project:** Verify project isn't paused (free tier)
- **Review RLS policies:** Ensure test operations aren't blocked by overly restrictive policies
- **Check rate limits:** Supabase free tier has request limits, may need delay between tests

---

### Problem: "Selector Not Found" Errors
**Symptoms:** Test fails with `Error: Locator not found`

**Diagnosis Steps:**
1. View failure screenshot in `test-results/[test-name]/screenshot.png`
2. Check if UI text changed (common with `:has-text()` selectors)
3. Verify element exists in DOM with browser DevTools

**Solutions:**
- **Update selector:** Match current UI text or structure
- **Use flexible regex:** Change `button:has-text("New")` to `button:has-text(/new|add|create/i)`
- **Add data-testid:** Recommended for stability (see KNOWN_ISSUES.md)
- **Wait for element:** Add `await page.waitForSelector('[selector]')` before action

---

### Problem: Tests Pass Locally But Fail in CI
**Symptoms:** Tests green locally, red in GitHub Actions

**Diagnosis Steps:**
1. Check CI environment variables (GitHub secrets)
2. Compare timeouts (CI is slower, needs more time)
3. Review CI logs for specific errors

**Solutions:**
- **Verify GitHub secrets:** Settings > Secrets > Actions, ensure `NEXT_PUBLIC_SUPABASE_*` match `.env.local`
- **Increase CI timeouts:** Already configured with `retries: 2` in CI mode
- **Add explicit waits:** Use `waitForLoadState('networkidle')` instead of hardcoded waits
- **Simulate CI locally:** Run `CI=true npx playwright test` to test in CI mode

---

### Problem: Database Fills with Test Data
**Symptoms:** Supabase project accumulating test users/workspaces

**Diagnosis Steps:**
1. Check test user count: SQL query `SELECT count(*) FROM auth.users WHERE email LIKE '%@example.com'`
2. Check workspace count: `SELECT count(*) FROM workspaces WHERE slug LIKE 'test-%'`

**Solutions:**
- **Manual cleanup (short-term):**
  - Supabase Dashboard > Authentication > Users > Delete test users
  - Supabase Dashboard > Table Editor > workspaces > Delete test workspaces
- **SQL cleanup:**
  ```sql
  -- Delete test workspaces (cascades to related data)
  DELETE FROM workspaces WHERE slug LIKE 'test-%';

  -- Delete test auth users
  -- (Requires service role, run via Supabase Dashboard SQL Editor)
  ```
- **Automated cleanup (planned):** See KNOWN_ISSUES.md #3

---

### Problem: Flaky Tests (Pass Sometimes, Fail Sometimes)
**Symptoms:** Same test passes and fails with no code changes

**Diagnosis Steps:**
1. Run test multiple times: `npx playwright test [test-file] --repeat-each=5`
2. Check for race conditions (async operations not properly awaited)
3. Review timing-sensitive code (animations, API calls)

**Common Causes & Fixes:**
- **Race condition:** Add `await page.waitForLoadState('networkidle')` after actions
- **Animation timing:** Wait for specific elements: `await page.waitForSelector('[data-testid="result"]')`
- **Network variability:** Increase timeout for specific operations: `{ timeout: 60000 }`
- **Hardcoded waits:** Replace `waitForTimeout(1000)` with network-based waits

---

### Problem: Drag-and-Drop Tests Fail
**Symptoms:** `admin.spec.ts` roadmap drag-and-drop test fails

**Known Issue:** Playwright's `dragTo()` method has known issues with some frameworks

**Solutions:**
- **Use manual drag-drop:**
  ```typescript
  await page.mouse.move(sourceX, sourceY)
  await page.mouse.down()
  await page.mouse.move(targetX, targetY)
  await page.mouse.up()
  ```
- **Skip test temporarily:** Add `test.skip()` if feature not critical
- **Use library-specific methods:** Check if @dnd-kit has test utilities

---

### Problem: Test Creates User But Can't Log In
**Symptoms:** Signup succeeds, but subsequent login fails

**Diagnosis Steps:**
1. Check Supabase auth settings (email confirmation enabled?)
2. Verify user actually created: Check Supabase Dashboard > Authentication
3. Review profile creation: Check `profiles` table for matching user ID

**Solutions:**
- **Disable email confirmation:** Supabase Dashboard > Authentication > Settings > Disable "Enable email confirmations"
- **Check profile creation:** Ensure `signUp` helper creates profile record
- **Review RLS policies:** Ensure profiles table allows INSERT for authenticated users

---

## Quick Reference Commands

```bash
# Run single test file with debugging
npx playwright test smoke.spec.ts --headed --timeout=30000

# Run all tests with increased timeout
npx playwright test --timeout=60000

# Run tests and generate HTML report
npx playwright test --reporter=html

# Run tests in UI mode (interactive debugging)
npm run test:e2e:ui

# View last test report
npm run test:e2e:report

# Run tests 3 times to check for flakiness
for i in {1..3}; do npm run test:e2e; done

# Simulate CI environment
CI=true npx playwright test --workers=1 --retries=2

# Run specific test by name
npx playwright test -g "should sign up"

# Run tests matching pattern
npx playwright test -g "should create"

# Show trace for failed test
npx playwright show-trace test-results/[test-name]/trace.zip
```

---

## Interactive Execution Script

For a guided, step-by-step test execution experience, run:

```bash
./run-e2e-tests.sh
```

This script will:
- Run tests in stages (smoke → auth → feedback → admin)
- Pause between stages for review
- Show expected pass rates for each stage
- Generate final HTML report

---

## Future Improvements

- [ ] Add data-testid attributes to all interactive elements (Priority: HIGH)
- [ ] Replace hardcoded waits with network-based waits (Priority: MEDIUM)
- [ ] Implement automated database cleanup script (Priority: MEDIUM)
- [ ] Add visual regression testing
- [ ] Add API mocking for faster tests
- [ ] Add performance testing
- [ ] Add accessibility testing (axe-core)
- [ ] Add mobile viewport tests
- [ ] Add cross-browser testing (Firefox, Safari)

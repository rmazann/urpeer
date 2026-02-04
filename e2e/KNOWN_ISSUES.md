# E2E Tests - Known Issues

*Last Updated: 2026-01-29*

## Critical Issues (Block Test Execution)

### ⚠️ 1. Supabase Email Rate Limit Exceeded
**Status:** **BLOCKING** - Causes 16/22 tests to fail
**Discovered:** 2026-01-29 during first test execution
**Error Message:** `"email rate limit exceeded"`

**Root Cause:**
- Tests create 22+ new users within ~4 minutes
- Supabase free tier rate limits email-based signups
- Form submission works, but Supabase auth.signUp() fails silently
- Server action returns error state instead of redirect, causing tests to timeout

**Evidence:**
- Toast notification shows: `Type: error, Text: email rate limit exceeded`
- Network trace shows POST /signup returns 200 with RSC error payload
- No redirect to /onboarding because signup fails before redirect() call
- Debug test: `e2e/debug-toast.spec.ts` reproduces the issue consistently

**Impact:**
- ❌ All auth tests fail (5/7)
- ❌ All feedback tests fail (5/5)
- ❌ All admin tests fail (6/6)
- ✅ Smoke tests pass (4/4) - don't create users
- ✅ Validation tests pass (2/2) - don't create users
- **Current Pass Rate:** 6/22 (27%)

**Solutions (choose one):**

**Option A: Quick Fix - Add Rate Limit Delays (10 minutes)**
- Add 2-3 second delay between tests that create users
- Modify `playwright.config.ts` to set `workers: 1` and longer `timeout`
- Pros: Immediate fix, no code changes needed
- Cons: Tests take 2-3x longer (~10-12 minutes total)

**Option B: Better Fix - Reuse Test Users (1 hour)**
- Pre-create 5-10 test user accounts via script
- Store credentials in test helper
- Most tests login with existing users instead of signing up
- Only 2-3 tests actually test signup flow
- Pros: Fast tests, avoids rate limits, more realistic
- Cons: Requires refactoring test helpers and managing user state

**Option C: Best Fix - Dedicated Test Database (2-3 hours)**
- Create separate Supabase project for testing only
- Configure higher/disabled rate limits for test project
- Update `.env.test` and GitHub secrets
- Pros: Proper test isolation, no rate limits, clean separation
- Cons: Requires Supabase account access, initial setup time

**Option D: Dashboard Fix - Increase Rate Limits (5 minutes)**
- Login to Supabase Dashboard
- Navigate to: Project Settings → Auth → Rate Limits
- Increase email signup rate limit from default to higher value
- Pros: Quickest fix if have dashboard access
- Cons: Affects production data, potential security risk

**Recommended:** Option A for immediate testing, Option C for long-term

---

## High Priority Issues (Cause Test Failures)

### 1. No data-testid Attributes
**Impact:** Brittle selectors that break on UI text changes
**Affected Tests:** All test suites
**Current Workaround:** Use flexible regex selectors like `:has-text(/new.*feedback/i)`
**Permanent Fix:** Add `data-testid` attributes to all interactive elements
**Estimated Effort:** 2-4 hours
**Priority:** HIGH
**Status:** Planned for future sprint

**Example Fix:**
```tsx
// Before
<Button type="submit">Sign In</Button>

// After
<Button type="submit" data-testid="login-submit">Sign In</Button>
```

---

### 2. Hardcoded Waits Instead of Network-Based Waits
**Impact:** Slower tests, potential flakiness due to timing issues
**Affected Tests:** `feedback.spec.ts` (8 occurrences), `admin.spec.ts` (6 occurrences)
**Current Pattern:** `await page.waitForTimeout(1000)`
**Recommended Pattern:** `await page.waitForLoadState('networkidle')`
**Estimated Effort:** 1-2 hours
**Priority:** MEDIUM
**Status:** Planned for future sprint

**Example Fix:**
```typescript
// Before
await page.click('button[type="submit"]')
await page.waitForTimeout(1000)
await expect(page.locator('.feedback-card')).toBeVisible()

// After
await page.click('button[type="submit"]')
await page.waitForLoadState('networkidle')
await expect(page.locator('.feedback-card')).toBeVisible()
```

---

## Medium Priority Issues (Degrade Experience)

### 3. No Database Cleanup
**Impact:** Test data accumulates in Supabase, could eventually cause rate limiting
**Current State:** Each test creates users/workspaces that persist
**Workaround:** Manual cleanup via Supabase Dashboard periodically
**Permanent Fix:** Implement automated cleanup script
**Estimated Effort:** 1-2 hours
**Priority:** MEDIUM
**Status:** Planned for future sprint

**Tracking:**
- Test users use email pattern: `test-*@example.com`
- Test workspaces use slug pattern: `test-*`
- Can be identified and cleaned via SQL queries

---

### 4. Some Tests Skip Gracefully
**Impact:** Reduced test coverage for incomplete features
**Affected Tests:**
  - `feedback.spec.ts` - "should filter feedback by status" (may skip)
  - `feedback.spec.ts` - "should search feedback" (may skip)
  - `admin.spec.ts` - "should drag roadmap item between columns" (may skip)
**Reason:** Features may not be fully implemented yet
**Current Behavior:** Tests use `test.skip()` when UI elements not found
**Action Required:**
  - Either implement missing features
  - Or remove tests for features not in scope
**Priority:** LOW
**Status:** Awaiting product decision

---

## Low Priority Issues (Nice-to-Have)

### 5. Single Browser Testing Only (Chromium)
**Impact:** No cross-browser validation
**Current:** Only Chromium configured in `playwright.config.ts`
**Future Enhancement:** Add Firefox and WebKit testing
**Estimated Effort:** 30 minutes (just config)
**Priority:** LOW

---

### 6. No Visual Regression Testing
**Impact:** UI changes not automatically validated
**Future Enhancement:** Add Playwright visual comparison
**Estimated Effort:** 2-3 hours
**Priority:** LOW

---

### 7. No Accessibility Testing
**Impact:** A11y issues not caught
**Future Enhancement:** Add axe-core integration
**Estimated Effort:** 1-2 hours
**Priority:** LOW

---

## Resolved Issues

*No resolved issues yet - this is the first test execution*

---

## Issue Reporting

To report new issues:
1. Check if issue already exists above
2. Run test with `--headed` flag to see visual behavior
3. Check `test-results/` for screenshots and traces
4. Document:
   - Test file and line number
   - Expected vs actual behavior
   - Screenshot if visual issue
   - Suggested fix if known

---

## Maintenance Schedule

- **Weekly:** Review test pass rate
- **Monthly:** Check for new flaky tests
- **Quarterly:** Review and update priorities
- **As needed:** Clean test data from Supabase

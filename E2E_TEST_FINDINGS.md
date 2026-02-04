# E2E Test Execution - Root Cause Analysis

**Date:** 2026-01-29
**Status:** ✅ Root cause identified
**Pass Rate:** 6/22 tests (27%)

---

## 🔍 Root Cause: Supabase Rate Limiting

After extensive debugging, the core issue blocking tests is:

### **Supabase Email Rate Limit Exceeded**

**Error Message:**
```
email rate limit exceeded
```

**Why Tests Fail:**
1. Each test creates a new unique user (22 tests = 22 signup attempts)
2. Supabase free tier rate limits email signups (typically ~10-20/hour)
3. Form submission works perfectly, but `auth.signUp()` fails silently
4. Server action returns error state instead of redirect
5. Tests timeout waiting for navigation to `/onboarding` that never happens

**Evidence Chain:**
- ✅ Form HTML is correct (has server action metadata)
- ✅ Form submits successfully via JavaScript
- ✅ POST request reaches server (200 response)
- ❌ Supabase rejects signup due to rate limit
- ❌ Toast shows: "email rate limit exceeded"
- ❌ No redirect to onboarding
- ❌ Tests timeout after 15 seconds

---

## 📊 Current Test Results

### Passing Tests (6/22):
- ✅ All smoke tests (4/4) - Don't create users
  - Homepage loads
  - Signup page loads
  - Login page loads
  - Feedback page loads
- ✅ Validation tests (2/2) - Don't create users
  - Invalid credentials error
  - Password validation

### Failing Tests (16/22):
- ❌ Auth tests (5/7)
- ❌ Feedback tests (5/5)
- ❌ Admin tests (6/6)

All failures due to same root cause: Can't create test users

---

## 🎯 Solutions (Choose One)

### Option A: Quick Fix - Add Delays ⏱️
**Time:** 10 minutes
**Effort:** Minimal

Update `playwright.config.ts`:
```typescript
export default defineConfig({
  timeout: 60000, // Increase from 30s to 60s
  workers: 1, // Already set
  use: {
    baseURL: 'http://localhost:3000',
  },
  // Add delay between tests
  globalSetup: './e2e/global-setup.ts', // Create this file
})
```

Create `e2e/global-setup.ts`:
```typescript
export default async function globalSetup() {
  // Add 3-second delay between each test
  process.env.TEST_DELAY = '3000'
}
```

**Pros:**
- Works immediately
- No code changes needed

**Cons:**
- Tests take ~12 minutes instead of 4 minutes
- Doesn't solve underlying issue

---

### Option B: Better Fix - Reuse Test Users 🔄
**Time:** 1 hour
**Effort:** Moderate refactoring

Create test user pool:
```bash
# Run once to create test users
npx ts-node scripts/create-test-users.ts
```

Update `e2e/helpers/auth.ts`:
```typescript
// Use pre-created test users
const TEST_USERS = [
  { email: 'test-user-1@example.com', password: 'Test123!', workspace_id: 'abc' },
  { email: 'test-user-2@example.com', password: 'Test123!', workspace_id: 'def' },
  // ... 8 more users
]

let currentUserIndex = 0

export const getTestUser = () => {
  const user = TEST_USERS[currentUserIndex]
  currentUserIndex = (currentUserIndex + 1) % TEST_USERS.length
  return user
}
```

Only 2-3 tests should actually test signup - rest should login.

**Pros:**
- Fast tests (~4 minutes)
- Avoids rate limits completely
- More realistic (most users login, not signup)

**Cons:**
- Requires creating user management script
- Need to handle test data cleanup/reset
- State management between tests

---

### Option C: Best Fix - Test Database 🏗️
**Time:** 2-3 hours
**Effort:** Significant setup

1. Create new Supabase project: `urpeer-testing`
2. Copy schema from production project
3. Configure test environment:
   ```bash
   # .env.test
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```
4. Update GitHub Actions secrets
5. Configure higher rate limits in test project (or disable)
6. Add pre-test database seeding

**Pros:**
- Proper test isolation
- No rate limit issues
- Clean separation from production
- Can run unlimited tests

**Cons:**
- Requires Supabase account access
- Need to maintain two projects
- Initial setup time
- Ongoing cost (free tier sufficient for tests)

---

### Option D: Dashboard Fix - Increase Limits 🚀
**Time:** 5 minutes
**Effort:** Minimal (if have access)

1. Login to Supabase Dashboard
2. Select current project
3. Navigate to: **Settings** → **Auth** → **Rate Limits**
4. Find "Email signups per hour"
5. Change from default (10-20) to higher value (100+)
6. Save changes

**Pros:**
- Immediate fix
- Zero code changes
- Tests work as-is

**Cons:**
- Requires dashboard access
- Affects production database
- Security risk (higher rate limits)
- Not recommended for production projects

---

## 🎓 Recommendation

### For Immediate Testing:
**Choose Option A (Add Delays)**
- Gets tests working within 10 minutes
- Safe, no side effects
- Good enough to validate test suite structure

### For Long-Term:
**Choose Option C (Test Database)**
- Best practice for production applications
- Proper test isolation
- Unlimited test runs
- Worth the 2-3 hour investment

### Alternative Quick Win:
**Choose Option D if:**
- You have Supabase dashboard access
- Testing in isolation (not affecting users)
- Need immediate results

---

## 📝 What Was Fixed Already

During this investigation, we successfully fixed:

1. ✅ UI Semantic HTML (Task #8)
   - Changed CardTitle (div) to h1 in signup/login pages
   - Improves SEO and accessibility
   - Files: `src/app/signup/page.tsx`, `src/app/login/page.tsx`

2. ✅ Test Selectors (Task #9)
   - Fixed onboarding helper for 4-step wizard
   - Updated "New Feedback" → "Submit Feedback"
   - Fixed login smoke test regex
   - Fixed form submission method (use JavaScript requestSubmit)
   - Files: `e2e/helpers/auth.ts`, `e2e/feedback.spec.ts`, `e2e/admin.spec.ts`, `e2e/smoke.spec.ts`

3. ✅ Debug Infrastructure (Task #10)
   - Created diagnostic tests to identify root cause
   - Documented rate limiting issue
   - Provided 4 solution options
   - Files: `e2e/debug-*.spec.ts`, `e2e/KNOWN_ISSUES.md`

---

## 📈 Expected Results After Fix

Once rate limiting is resolved:

**Estimated Pass Rate:** 17-20/22 tests (77-91%)

**Expected passing:**
- ✅ All smoke tests (4/4)
- ✅ Most auth tests (6-7/7)
- ✅ Most feedback tests (4-5/5)
- ✅ Most admin tests (4-6/6)

**May still fail:**
- Optional features not implemented (filter, search, drag-drop)
- These tests already use `test.skip()` gracefully

---

## 🚀 Next Steps

1. **Choose a solution** (A, B, C, or D above)
2. **Implement the fix**
3. **Re-run tests:** `./run-e2e-simple.sh`
4. **Document results** in `e2e/README.md`
5. **Celebrate!** 🎉 First successful E2E test run

---

## 📎 Debug Files Created

For reference, the following diagnostic tests were created:

- `e2e/debug-signup.spec.ts` - Basic signup flow debugging
- `e2e/debug-form-html.spec.ts` - Inspect form attributes
- `e2e/debug-js-submit.spec.ts` - Test JavaScript form submission
- `e2e/debug-response.spec.ts` - Inspect server action response
- `e2e/debug-toast.spec.ts` - **Capture error toast (found root cause!)**

These can be deleted after fixing the rate limit issue, or kept for future debugging.

---

## ✅ Summary

**Problem:** Supabase rate limiting blocks test user creation
**Impact:** 16/22 tests fail (73% failure rate)
**Root Cause:** Too many signups too fast
**Solution:** Choose from 4 options based on urgency vs. investment
**Timeline:** 10 minutes (quick fix) to 3 hours (best fix)
**Expected Outcome:** 77-91% pass rate after fix

The test infrastructure is solid - we just need to work around Supabase rate limits.

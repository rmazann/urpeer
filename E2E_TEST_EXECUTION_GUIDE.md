# 🧪 E2E Test Execution Guide - READY TO RUN

**Status:** ✅ Environment Verified, Tests Ready
**Date:** 2026-01-29
**Total Tests:** 22 (4 smoke + 7 auth + 5 feedback + 6 admin)

---

## 🎯 Quick Start

You have **two options** for running tests:

### Option 1: Interactive Script (RECOMMENDED for first run)
```bash
./run-e2e-tests.sh
```

This guided script will:
- Run tests in stages with pauses between
- Show expected pass rates
- Let you review results between stages
- Generate final HTML report

### Option 2: Direct Commands
```bash
# Run individual suites
npx playwright test smoke.spec.ts --headed --timeout=30000
npx playwright test auth.spec.ts --headed --timeout=30000
npx playwright test feedback.spec.ts --headed --timeout=30000
npx playwright test admin.spec.ts --headed --timeout=30000

# Or run everything at once
npm run test:e2e
```

---

## ✅ Environment Status

| Component | Status | Details |
|-----------|--------|---------|
| Dev Server | ✅ Running | Port 3000 (PID: 795) |
| Supabase | ✅ Configured | Credentials in `.env.local` |
| Playwright | ✅ Installed | Version 1.58.0 |
| Chromium | ✅ Ready | Browser installed |

**All systems are GO! You can run tests immediately.**

---

## 📊 Expected Results

### Realistic Expectations
- **Minimum Success:** 17/22 tests pass (77%)
- **Ideal Success:** 20-22/22 tests pass (90-100%)
- **Execution Time:** 5-10 minutes

### Known Skippable Tests
These tests may skip gracefully if features aren't implemented:
- `feedback.spec.ts` - "should filter feedback by status"
- `feedback.spec.ts` - "should search feedback"
- `admin.spec.ts` - "should drag roadmap item between columns"

**If these skip, that's OKAY and expected!**

---

## 🚀 Execution Steps

### Step 1: Run Tests
Choose your method (interactive script recommended):

```bash
# Interactive (RECOMMENDED)
./run-e2e-tests.sh

# OR Direct
npm run test:e2e
```

### Step 2: Review Results
After tests complete:

```bash
# Open HTML report in browser
npm run test:e2e:report
```

**What to check:**
- Total pass/fail count
- Screenshots of failures (if any)
- Execution time
- Any timeout or connection errors

### Step 3: Document Results
Edit `e2e/README.md` and fill in the execution log template:

```markdown
### Run: 2026-01-29 [YOUR_TIME]
- **Environment:** Local (macOS, Chromium)
- **Results:** [X]/22 passed ([Y]%)
- **Execution Time:** [Z] minutes
- **Issues Found:**
  - [List any failures]
- **Notes:** [Observations]
```

### Step 4: Check Supabase (Optional)
Verify test data was created:

**Supabase Dashboard:**
- Authentication > Users → Should see ~20 test users (emails ending in @example.com)
- Table Editor > workspaces → Should see ~15 test workspaces (slugs starting with "test-")

---

## ⚠️ Common Issues & Quick Fixes

### Issue: Dev Server Not Responding
```bash
# Restart dev server
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: Tests Timeout
```bash
# Run with longer timeout
npx playwright test --timeout=60000
```

### Issue: Selector Not Found
- Check screenshot in `test-results/[test-name]/screenshot.png`
- UI text may have changed
- See detailed troubleshooting in `e2e/README.md`

### Issue: Supabase Connection Failed
- Verify `.env.local` has correct credentials
- Check Supabase project isn't paused (Dashboard > Settings)

---

## 📝 After Test Execution

### If Tests Pass (17+ / 22)
1. ✅ Document results in `e2e/README.md`
2. ✅ Review `e2e/KNOWN_ISSUES.md` for future improvements
3. ✅ Consider running CI workflow test (optional)
4. ✅ Schedule improvements (data-testid, cleanup script)

### If Tests Fail (<17 / 22)
1. ❌ Review failure screenshots and traces
2. ❌ Check `test-results/` folder for details
3. ❌ Consult `e2e/README.md` troubleshooting guide
4. ❌ Fix critical issues before proceeding
5. ❌ Re-run tests to verify fixes

---

## 🎯 Success Criteria Checklist

Use this checklist to validate test execution:

- [ ] At least 17/22 tests pass (77% pass rate)
- [ ] HTML report generated successfully
- [ ] Screenshots captured for any failures
- [ ] No infrastructure errors (connection, timeout, crash)
- [ ] Test users created in Supabase
- [ ] Test workspaces created in Supabase
- [ ] Execution time < 10 minutes
- [ ] Results documented in `e2e/README.md`

---

## 📋 Test Breakdown

### Smoke Tests (4 tests) - SIMPLEST
- Homepage loads
- Signup page loads with form fields
- Login page loads with form fields
- Feedback page loads (may redirect to login)

**Expected:** 4/4 pass

---

### Auth Tests (7 tests) - CRITICAL PATH
- Full signup + onboarding flow
- Profile creation failure recovery
- Login and redirect logic
- Validation errors (email, password)

**Expected:** 6-7/7 pass

**Creates:** ~7 test users, ~4 workspaces

---

### Feedback Tests (5 tests) - CORE FEATURES
- Create feedback
- Vote and unvote
- View details and comment
- Filter by status (may skip)
- Search (may skip)

**Expected:** 3-5/5 pass

**Creates:** ~5 test users, ~8 feedback items, comments

---

### Admin Tests (6 tests) - ADMIN FEATURES
- Access admin dashboard
- Create roadmap items
- Drag-and-drop (may skip)
- Publish changelog
- Update feedback status
- View statistics

**Expected:** 4-6/6 pass

**Creates:** ~6 test users (each becomes admin)

---

## 🔧 Files Created/Updated

| File | Purpose |
|------|---------|
| `run-e2e-tests.sh` | Interactive test execution script (EXECUTABLE) |
| `e2e/KNOWN_ISSUES.md` | Known issues and improvement roadmap (NEW) |
| `e2e/README.md` | Updated with execution log template and troubleshooting (UPDATED) |
| `/Users/rmazan/.claude/plans/tender-dreaming-quill.md` | Full execution plan (REFERENCE) |

---

## 🚦 Next Steps

1. **Run tests now:**
   ```bash
   ./run-e2e-tests.sh
   ```

2. **After execution:**
   - Review HTML report: `npm run test:e2e:report`
   - Document results in `e2e/README.md`
   - Check `e2e/KNOWN_ISSUES.md` for future work

3. **Schedule improvements** (see plan):
   - Week 1-2: Add data-testid attributes
   - Week 2-3: Replace hardcoded waits
   - Week 3-4: Implement cleanup script

---

## 💡 Pro Tips

1. **First run:** Use interactive script (`./run-e2e-tests.sh`) to see tests visually
2. **Debugging:** Use `--headed` flag to watch browser actions
3. **Flakiness check:** Run suite 2-3 times to ensure consistency
4. **CI simulation:** Run `CI=true npx playwright test` to test CI behavior

---

## 📚 Additional Resources

- **Full Plan:** `/Users/rmazan/.claude/plans/tender-dreaming-quill.md`
- **Known Issues:** `e2e/KNOWN_ISSUES.md`
- **Detailed Guide:** `e2e/README.md`
- **Playwright Docs:** https://playwright.dev/docs/intro

---

## 🎉 You're Ready!

Everything is configured and ready. Run the tests and document the results!

```bash
./run-e2e-tests.sh
```

Good luck! 🚀

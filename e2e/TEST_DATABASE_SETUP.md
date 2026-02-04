# E2E Test Database Setup Guide

**Goal:** Create a dedicated Supabase project for E2E testing to avoid rate limits and ensure proper test isolation.

**Estimated Time:** 2-3 hours (first time), 30 minutes (if you've done it before)

---

## Step 1: Create Test Supabase Project (15 minutes)

### 1.1 Create New Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Name:** `urpeer-testing` (or any name you prefer)
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose same as production (for consistency)
   - **Pricing Plan:** Free tier is sufficient for testing
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to provision

### 1.2 Get Project Credentials
Once project is ready:

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://[your-project-ref].supabase.co
   anon/public key: eyJ... (long JWT token)
   service_role key: eyJ... (long JWT token - keep secret!)
   ```

---

## Step 2: Copy Database Schema (30 minutes)

You need to copy the schema from your production database to the test database.

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to production project:**
   ```bash
   supabase link --project-ref [production-project-ref]
   ```

4. **Pull current schema:**
   ```bash
   supabase db pull
   ```
   This creates migrations in `supabase/migrations/`

5. **Link to test project:**
   ```bash
   supabase link --project-ref [test-project-ref]
   ```

6. **Push schema to test project:**
   ```bash
   supabase db push
   ```

### Option B: Using SQL Dump (Alternative)

1. Go to production project → **Database** → **Backups**
2. Download latest backup (or create new one)
3. Go to test project → **SQL Editor**
4. Run the SQL from the backup file
5. Verify tables exist: **Table Editor** tab

### Required Tables
Verify these tables exist in test project:
- ✅ `profiles`
- ✅ `workspaces`
- ✅ `feedback`
- ✅ `feedback_votes`
- ✅ `feedback_comments`
- ✅ `roadmap_items`
- ✅ `changelog_entries`

---

## Step 3: Configure Auth Settings (10 minutes)

### 3.1 Disable Email Confirmation (For Testing)
1. Go to **Authentication** → **Providers** → **Email**
2. **Disable:** "Confirm email"
3. Click **Save**

**Why:** Tests create users instantly without email verification delays

### 3.2 Increase Rate Limits
1. Go to **Settings** → **Auth** → **Rate Limits**
2. Find "Email signups per hour"
3. Set to **100** or **unlimited** (custom plan)
4. Click **Save**

**Why:** Allow tests to create many users quickly

### 3.3 Configure Redirect URLs (Optional)
1. Go to **Authentication** → **URL Configuration**
2. Add test URLs:
   - `http://localhost:3000/**` (for local testing)
   - Your CI/CD test URL if applicable
3. Click **Save**

---

## Step 4: Create Test Environment File (5 minutes)

Create `.env.test` in project root:

```bash
# Supabase Test Project Credentials
# DO NOT COMMIT THIS FILE - Add to .gitignore
NEXT_PUBLIC_SUPABASE_URL=https://[your-test-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (paste anon key here)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (paste service role key here)

# Test Configuration
NODE_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.1 Update .gitignore

```bash
echo ".env.test" >> .gitignore
```

**Important:** Never commit `.env.test` with real credentials!

---

## Step 5: Update Test Configuration (15 minutes)

### 5.1 Create Test Environment Loader

Create `e2e/test-env-setup.ts`:

```typescript
import { config } from 'dotenv'
import { resolve } from 'path'

// Load test environment variables
export function loadTestEnv() {
  const envPath = resolve(process.cwd(), '.env.test')

  config({ path: envPath })

  // Verify required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in .env.test: ${missing.join(', ')}\n` +
      `Please follow the setup guide: e2e/TEST_DATABASE_SETUP.md`
    )
  }

  console.log('✅ Test environment loaded:', process.env.NEXT_PUBLIC_SUPABASE_URL)
}
```

### 5.2 Update Playwright Config

Edit `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

// Load test environment before tests run
import { loadTestEnv } from './e2e/test-env-setup'
loadTestEnv()

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep sequential to avoid race conditions

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  timeout: 60000, // Increased for potential network delays

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

### 5.3 Create Test Runner Script

Create `run-e2e-with-test-db.sh`:

```bash
#!/bin/bash

set -e

echo "=========================================="
echo "  E2E Tests - Using Test Database"
echo "=========================================="
echo ""

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "❌ Error: .env.test file not found!"
    echo ""
    echo "Please follow the setup guide:"
    echo "  e2e/TEST_DATABASE_SETUP.md"
    echo ""
    exit 1
fi

# Check if dev server is running
echo "Checking dev server..."
if curl -s --max-time 3 http://localhost:3000 > /dev/null; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is NOT running"
    echo ""
    echo "Please start dev server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "Running tests with test database..."
echo ""

# Run Playwright tests
npx playwright test

echo ""
echo "=========================================="
echo "  Test execution complete!"
echo "=========================================="
echo ""
echo "View report: npm run test:e2e:report"
```

Make it executable:
```bash
chmod +x run-e2e-with-test-db.sh
```

---

## Step 6: Update GitHub Actions (20 minutes)

### 6.1 Add Secrets to GitHub

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets (from test project):

   ```
   TEST_SUPABASE_URL = https://[test-project-ref].supabase.co
   TEST_SUPABASE_ANON_KEY = eyJ... (anon key)
   TEST_SUPABASE_SERVICE_ROLE_KEY = eyJ... (service role key)
   ```

### 6.2 Update Workflow File

Edit `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 15
    runs-on: ubuntu-latest

    env:
      # Use test database in CI
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Build Next.js app
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload test screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

---

## Step 7: Verify Setup (15 minutes)

### 7.1 Test Local Connection

Create `e2e/verify-test-db.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test('verify test database connection', async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Anon Key exists:', !!supabaseKey)

  expect(supabaseUrl).toBeTruthy()
  expect(supabaseKey).toBeTruthy()
  expect(supabaseUrl).toContain('supabase.co')

  console.log('✅ Test database configuration valid')
})
```

Run verification:
```bash
npx playwright test verify-test-db.spec.ts
```

### 7.2 Test User Creation

Create `e2e/verify-signup.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { signUpAndOnboard } from './helpers/auth'

test('verify user creation works', async ({ page }) => {
  console.log('Testing user creation in test database...')

  const result = await signUpAndOnboard(page)

  console.log('✅ User created:', result.user.email)
  console.log('✅ Workspace created:', result.workspace.slug)

  // Verify we're on feedback page
  await expect(page).toHaveURL('/feedback')

  console.log('✅ Full signup flow works!')
})
```

Run test:
```bash
npx playwright test verify-signup.spec.ts --headed
```

**Expected result:** User created successfully, redirects to feedback page

---

## Step 8: Clean Up Test Data (Optional - 30 minutes)

### 8.1 Create Cleanup Script

Create `scripts/cleanup-test-data.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load test environment
config({ path: resolve(process.cwd(), '.env.test') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup() {
  console.log('🧹 Cleaning up test data...')

  // Delete test users (email pattern: test-*@example.com)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .like('email', 'test-%@example.com')

  if (profiles && profiles.length > 0) {
    console.log(`Found ${profiles.length} test users to delete`)

    for (const profile of profiles) {
      // Delete user from auth
      await supabase.auth.admin.deleteUser(profile.id)
      console.log(`✅ Deleted user: ${profile.id}`)
    }
  }

  // Delete test workspaces (slug pattern: test-*)
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, slug')
    .like('slug', 'test-%')

  if (workspaces && workspaces.length > 0) {
    console.log(`Found ${workspaces.length} test workspaces to delete`)

    const ids = workspaces.map(w => w.id)
    await supabase.from('workspaces').delete().in('id', ids)
    console.log(`✅ Deleted ${workspaces.length} workspaces`)
  }

  console.log('✅ Cleanup complete!')
}

cleanup().catch(console.error)
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:cleanup": "tsx scripts/cleanup-test-data.ts"
  }
}
```

Run cleanup:
```bash
npm run test:cleanup
```

---

## Step 9: Run Full Test Suite (10 minutes)

Now everything is ready!

### 9.1 Start Dev Server
```bash
npm run dev
```

### 9.2 Run Tests
```bash
./run-e2e-with-test-db.sh
```

**Expected result:** 17-20/22 tests passing (77-91%)

### 9.3 View Report
```bash
npm run test:e2e:report
```

---

## Troubleshooting

### Issue: "Missing required environment variables"
**Solution:**
- Verify `.env.test` exists
- Check credentials are correct
- Run verification test: `npx playwright test verify-test-db.spec.ts`

### Issue: Tests still fail with rate limit
**Solution:**
- Check you're using test database (check console output)
- Verify auth rate limits in test project dashboard
- Try disabling rate limits completely for test project

### Issue: Schema missing tables
**Solution:**
- Re-run schema migration (Step 2)
- Verify tables exist in Supabase dashboard
- Check RLS policies are copied

### Issue: RLS policies block operations
**Solution:**
- Service role key should bypass RLS
- Verify `.env.test` has `SUPABASE_SERVICE_ROLE_KEY`
- Check server-side code uses service role for admin operations

---

## Maintenance

### Weekly
- Run cleanup script: `npm run test:cleanup`
- Check test database size (Supabase dashboard)

### Monthly
- Review failed tests
- Update schema if production schema changed
- Check rate limit usage

### After Schema Changes
1. Update production database
2. Pull schema: `supabase db pull`
3. Push to test: `supabase db push` (linked to test project)
4. Verify tests still pass

---

## Summary Checklist

- [ ] Created test Supabase project
- [ ] Copied credentials to `.env.test`
- [ ] Copied database schema to test project
- [ ] Disabled email confirmation in test project
- [ ] Increased/disabled rate limits in test project
- [ ] Created `e2e/test-env-setup.ts`
- [ ] Updated `playwright.config.ts`
- [ ] Created `run-e2e-with-test-db.sh`
- [ ] Added GitHub secrets for CI/CD
- [ ] Updated `.github/workflows/e2e-tests.yml`
- [ ] Ran verification tests
- [ ] Ran full test suite
- [ ] Tests passing at 77%+ rate
- [ ] Created cleanup script
- [ ] Added `.env.test` to `.gitignore`

---

## Next Steps

Once setup is complete:
1. ✅ Run tests regularly to catch regressions
2. ✅ Add new tests as features are developed
3. ✅ Monitor test database size and clean up periodically
4. ✅ Consider adding visual regression tests (optional)
5. ✅ Document any new test patterns in `e2e/README.md`

---

**Estimated Results After Setup:**
- 🎯 **17-20/22 tests passing** (77-91%)
- ⚡ **4-5 minute test execution** (no delays needed)
- 🔄 **Unlimited test runs** (no rate limits)
- 🔒 **Proper test isolation** (separate from production)
- 🚀 **Ready for CI/CD** (GitHub Actions configured)

**Time Investment:** 2-3 hours
**Value:** Unlimited, reliable E2E testing ✨

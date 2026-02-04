# E2E Test Database - Quick Start

**Goal:** Get test database working in 30 minutes

---

## Prerequisites

- [ ] Supabase account with access to dashboard
- [ ] Node.js and npm installed
- [ ] Project already has Playwright installed

---

## Step-by-Step

### 1. Create Test Supabase Project (5 min)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `urpeer-testing`
4. Wait for provisioning (~2 minutes)

### 2. Get Credentials (2 min)

1. In test project, go to **Settings** → **API**
2. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

### 3. Configure Environment (3 min)

```bash
# Copy template
cp .env.test.example .env.test

# Edit .env.test and paste your credentials
nano .env.test
```

### 4. Copy Database Schema (10 min)

**Option A - Using Supabase CLI:**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to production
supabase link --project-ref [production-ref]

# Pull schema
supabase db pull

# Link to test
supabase link --project-ref [test-ref]

# Push schema
supabase db push
```

**Option B - Manual:**
1. Production project → Database → Backups → Download
2. Test project → SQL Editor → Paste SQL → Run

### 5. Configure Test Database (5 min)

In test project dashboard:

1. **Authentication** → **Providers** → **Email**
   - Disable "Confirm email"
   - Save

2. **Settings** → **Auth** → **Rate Limits**
   - Set email signups to 100 or unlimited
   - Save

### 6. Verify Setup (5 min)

```bash
# Start dev server
npm run dev

# In another terminal, run verification
npm run test:e2e:verify
```

**Expected output:**
```
✅ Test database configuration valid
✅ Test database connection successful
✅ User created: test-...@example.com
✅ Full signup flow works!

2 passed (10s)
```

### 7. Run Full Test Suite

```bash
./run-e2e-with-test-db.sh
```

**Expected result:** 17-20/22 tests passing (77-91%)

---

## Troubleshooting

### "Missing .env.test file"
→ Run: `cp .env.test.example .env.test` and fill in credentials

### "Missing required environment variables"
→ Check `.env.test` has all values from test project

### Verification test fails with "rate limit exceeded"
→ Check auth rate limits in test project dashboard

### Schema missing tables
→ Re-run schema migration (Step 4)

---

## Maintenance

### Clean test data (run weekly)
```bash
npm run test:cleanup
```

### Update schema after changes
```bash
supabase db pull
supabase link --project-ref [test-ref]
supabase db push
```

---

## Success Checklist

- [ ] Test project created
- [ ] Credentials in `.env.test`
- [ ] Schema copied to test project
- [ ] Email confirmation disabled
- [ ] Rate limits increased
- [ ] Verification tests pass
- [ ] Full test suite at 77%+ pass rate

---

## Next Steps

✅ **Setup complete!** Your tests now use a dedicated test database.

Run tests anytime:
```bash
./run-e2e-with-test-db.sh
```

View results:
```bash
npm run test:e2e:report
```

---

**Need help?** See full guide: `e2e/TEST_DATABASE_SETUP.md`

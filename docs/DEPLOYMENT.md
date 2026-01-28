# Urpeer.com Deployment Guide

This guide walks you through deploying Urpeer.com to production using Vercel and Supabase.

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Supabase Account](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com) (for automatic deployments)

## Step 1: Supabase Production Setup

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name:** urpeer-production
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
5. Click "Create new project"

### 1.2 Run Database Migrations

Using Supabase CLI:

```bash
# Link to your production project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations to production
npx supabase db push
```

Or manually via SQL Editor in Supabase Dashboard - copy contents from:
- `supabase/migrations/20260128000001_initial_schema.sql`
- `supabase/migrations/20260128000002_indexes.sql`
- `supabase/migrations/20260128000003_rls_policies.sql`
- `supabase/migrations/20260128000004_triggers.sql`

### 1.3 Configure Authentication

1. Go to **Authentication > Providers**
2. Enable Email provider (enabled by default)
3. Go to **Authentication > URL Configuration**
4. Set **Site URL:** `https://urpeer.com`
5. Add **Redirect URLs:**
   - `https://urpeer.com/**`
   - `https://*.vercel.app/**` (for preview deployments)

### 1.4 Get API Keys

1. Go to **Settings > API**
2. Copy these values for Vercel:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Vercel Deployment

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)

### 2.2 Configure Environment Variables

Add these environment variables in Vercel project settings:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | All |
| `NEXT_PUBLIC_SITE_URL` | `https://urpeer.com` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.urpeer.com` | Preview |

### 2.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at the generated URL

### 2.4 Configure Custom Domain

1. Go to **Project Settings > Domains**
2. Add `urpeer.com`
3. Follow DNS configuration instructions:
   - Add CNAME record: `@` → `cname.vercel-dns.com`
   - Or A record: `@` → `76.76.21.21`
4. Add `www.urpeer.com` (optional, redirects to apex)

## Step 3: Post-Deployment Verification

### 3.1 Smoke Test Checklist

- [ ] Homepage loads correctly
- [ ] User can sign up with email
- [ ] User can log in
- [ ] User can submit feedback
- [ ] User can vote on feedback
- [ ] Roadmap page displays items
- [ ] Changelog page displays entries
- [ ] RSS feed works (`/api/changelog/rss`)
- [ ] Admin dashboard accessible (for admin users)
- [ ] 404 page displays for invalid routes

### 3.2 Create Admin User

1. Sign up with your admin email
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find your user and set `role` to `admin`

## Step 4: Optional Enhancements

### 4.1 Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Install SDK:
   ```bash
   npm install @sentry/nextjs
   ```
3. Run setup wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
4. Add environment variable in Vercel:
   - `SENTRY_DSN`: Your Sentry DSN

### 4.2 Vercel Analytics

Analytics are automatically enabled on Vercel deployments.

To add Web Vitals tracking:

```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'

// In the body:
<Analytics />
```

### 4.3 Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

Add to `src/app/layout.tsx`:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

// In the body:
<SpeedInsights />
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Run `npm run build` locally to reproduce
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Import path issues

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check Supabase project is running (not paused)
3. Verify RLS policies allow the operations

### Authentication Not Working

1. Check Site URL in Supabase matches your domain
2. Verify redirect URLs include your domain
3. Check browser console for errors

## Maintenance

### Updating Dependencies

```bash
npm update
npm audit fix
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new migration_name

# Apply to production
npx supabase db push
```

### Monitoring

- **Vercel:** Project > Analytics tab
- **Supabase:** Project > Reports
- **Sentry:** Issues dashboard (if configured)

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] Supabase RLS policies are enabled on all tables
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Security headers are configured (via vercel.json)
- [ ] Admin access is properly restricted
- [ ] No sensitive data in client-side code

## Support

For issues, create a GitHub issue or contact support@urpeer.com

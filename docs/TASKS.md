# Urpeer.com - Implementation Tasks

> A checkable task list for implementing Urpeer.com from zero to production.
> Total Duration: 13 days (aggressive) / 26 days (part-time)

---

## Phase 0: Project Initialization & Dependencies (Day 1) ✅

### Tasks
- [x] **0.1** Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router
- [x] **0.2** Install core dependencies (@supabase/supabase-js, @supabase/ssr, zod, react-hook-form, sonner, lucide-react, clsx, tailwind-merge, @dnd-kit/*, date-fns, react-markdown, remark-gfm)
- [x] **0.3** Install dev dependencies (vitest, @testing-library/react, eslint-config-prettier, supabase CLI)
- [x] **0.4** Create directory structure:
  - [x] `src/app`
  - [x] `src/features/{feedback,roadmap,changelog,comments,auth,admin}/{components,actions,hooks,types}`
  - [x] `src/components/ui`
  - [x] `src/lib/{supabase,utils,validations}`
  - [x] `supabase/{migrations,seed}`
- [x] **0.5** Configure TypeScript (`tsconfig.json` with strict mode)
- [x] **0.6** Configure Vitest (`vitest.config.ts`)
- [x] **0.7** Initialize Supabase CLI (`npx supabase init`)
- [x] **0.8** Create `.env.local.example` template

### Files to Create
- [x] `src/app/layout.tsx`
- [x] `src/app/page.tsx`
- [x] `src/lib/utils.ts`
- [x] `.env.local.example`
- [x] `vitest.config.ts`

### Verification
- [x] `npm run dev` runs successfully on http://localhost:3000
- [x] `npm run type-check` passes with no errors
- [x] `npm run lint` passes
- [x] All directories exist
- [x] `.env.local` created from example

---

## Phase 1: Supabase Setup & Database Schema (Day 2-3) ✅

### Tasks
- [x] **1.1** Create Supabase Cloud project
  - [x] Create project on https://supabase.com/dashboard
  - [x] Save project URL and anon key to `.env.local`
  - [x] Link local project: `npx supabase link --project-ref <ref>`
- [x] **1.2** Create migration: Initial Schema (`20260128000001_initial_schema.sql`)
  - [x] workspaces table
  - [x] profiles table
  - [x] feedback table
  - [x] votes table
  - [x] roadmap_items table
  - [x] changelog_entries table
  - [x] changelog_feedback_links table
  - [x] comments table
- [x] **1.3** Create migration: Indexes (`20260128000002_indexes.sql`)
  - [x] idx_feedback_workspace
  - [x] idx_feedback_status
  - [x] idx_feedback_vote_count
  - [x] idx_feedback_created_at
  - [x] idx_feedback_author
  - [x] idx_votes_feedback
  - [x] idx_votes_user
  - [x] idx_roadmap_workspace
  - [x] idx_roadmap_status
  - [x] idx_roadmap_display_order
  - [x] idx_changelog_workspace
  - [x] idx_changelog_published
  - [x] idx_comments_feedback
  - [x] idx_comments_author
- [x] **1.4** Create migration: RLS Policies (`20260128000003_rls_policies.sql`)
  - [x] Enable RLS on all 8 tables
  - [x] Workspaces policies (SELECT, INSERT, UPDATE, DELETE)
  - [x] Profiles policies (SELECT, INSERT, UPDATE)
  - [x] Feedback policies (SELECT, INSERT, UPDATE, DELETE)
  - [x] Votes policies (SELECT, INSERT, DELETE)
  - [x] Roadmap policies (SELECT, INSERT, UPDATE, DELETE - admin only)
  - [x] Changelog policies (SELECT, INSERT, UPDATE, DELETE - admin only)
  - [x] Changelog links policies (SELECT, INSERT, DELETE)
  - [x] Comments policies (SELECT, INSERT, UPDATE, DELETE)
- [x] **1.5** Create migration: Triggers (`20260128000004_triggers.sql`)
  - [x] update_feedback_vote_count trigger
  - [x] update_feedback_comment_count trigger
  - [x] update_updated_at_column triggers (6 tables)
  - [x] handle_new_user trigger (auto-create profile on signup)
- [x] **1.6** Create seed data script (`supabase/seed/seed.sql`)
- [x] **1.7** Push migrations to database (`npx supabase db push`)

### Verification
- [x] Migrations pushed successfully
- [x] All 8 tables exist
- [x] RLS enabled on all tables
- [x] Triggers created
- [x] Indexes created
- [x] TypeScript types generated (`src/lib/supabase/database.types.ts`)

---

## Phase 2: Supabase Client & Authentication Infrastructure (Day 3-4) ✅

### Tasks
- [x] **2.1** Create Supabase Browser Client (`src/lib/supabase/client.ts`)
- [x] **2.2** Create Supabase Server Client (`src/lib/supabase/server.ts`)
- [x] **2.3** Create Middleware for Auth (`src/middleware.ts`)
  - [x] Route protection for /admin
  - [x] Admin role check for admin routes
  - [x] Route protection for /profile
- [x] **2.4** Generate TypeScript types from database
  - [x] Run: `npx supabase gen types typescript --project-id > src/lib/supabase/database.types.ts`
  - [x] Create convenience types file (`src/lib/supabase/types.ts`)
- [x] **2.5** Create Zod validation schemas
  - [x] `src/lib/validations/feedback.ts`
  - [x] `src/lib/validations/roadmap.ts`
  - [x] `src/lib/validations/changelog.ts`
  - [x] `src/lib/validations/comment.ts`
  - [x] `src/lib/validations/index.ts` (exports)
- [x] **2.6** Create utility functions
  - [x] `src/lib/utils.ts` (cn, formatDate, formatRelativeTime, calculatePriorityScore)
  - [x] `src/lib/utils/auth.ts` (getUser, getProfile, requireAuth, requireProfile, isAdmin, requireAdmin)

### Verification
- [x] `npm run type-check` passes with no errors
- [x] Generated database types file exists at `src/lib/supabase/database.types.ts`
- [x] All Zod schemas validate correctly
- [x] Server client can be imported without errors

---

## Phase 3: Authentication UI & User Management (Day 4-5) ✅

### Tasks
- [x] **3.1** Create auth feature structure (`src/features/auth/{components,actions}`)
- [x] **3.2** Install Shadcn UI components
  - [x] `npx shadcn@latest init`
  - [x] `npx shadcn@latest add button input label card sonner`
- [x] **3.3** Create auth server actions (`src/features/auth/actions/auth.ts`)
  - [x] signup action
  - [x] login action
  - [x] logout action
- [x] **3.4** Create Login Page (`src/app/login/page.tsx`)
- [x] **3.5** Create Signup Page (`src/app/signup/page.tsx`)
- [x] **3.6** Create Header Navigation Component (`src/components/Header.tsx`)
- [x] **3.7** Update Root Layout (`src/app/layout.tsx`)
  - [x] Add Header component
  - [x] Add Toaster component
- [x] **3.8** Create Profile Management Page (`src/app/profile/page.tsx`)
- [x] **3.9** Create Home Page (`src/app/page.tsx`)
- [x] **3.10** Create Feedback placeholder page (`src/app/feedback/page.tsx`)

### Verification
- [x] `npm run type-check` passes
- [x] All pages return HTTP 200 (/, /login, /signup, /feedback)
- [x] Header component renders correctly
- [x] Toaster configured for error notifications

---

## Phase 4: Feedback Board - Core Feature (Day 5-7)

### Tasks
- [ ] **4.1** Install additional Shadcn components
  - [ ] `npx shadcn@latest add dialog select badge skeleton textarea`
- [ ] **4.2** Create feedback server actions
  - [ ] `src/features/feedback/actions/get-feedback.ts`
  - [ ] `src/features/feedback/actions/create-feedback.ts`
  - [ ] `src/features/feedback/actions/vote.ts`
- [ ] **4.3** Create feedback components
  - [ ] `src/features/feedback/components/FeedbackCard.tsx`
  - [ ] `src/features/feedback/components/VoteButton.tsx` (client component)
  - [ ] `src/features/feedback/components/NewFeedbackDialog.tsx` (client component)
- [ ] **4.4** Create Feedback Page (`src/app/feedback/page.tsx`)
  - [ ] Feedback list with server-side filtering
  - [ ] Status filter dropdown
  - [ ] Sort by dropdown (votes/recent)
  - [ ] New Feedback button

### Verification
- [ ] Navigate to `/feedback` and see list of feedback
- [ ] Click "New Feedback" button and create feedback
- [ ] Vote on feedback item (count increments)
- [ ] Unvote (count decrements)
- [ ] Filter by status (dropdown works)
- [ ] Sort by votes vs recent
- [ ] Click feedback title to navigate to detail page
- [ ] Non-authenticated users can view but not create/vote

---

## Phase 5: Feedback Detail Page & Comments (Day 7-8)

### Tasks
- [ ] **5.1** Create comment server actions
  - [ ] `src/features/comments/actions/get-comments.ts`
  - [ ] `src/features/comments/actions/create-comment.ts`
  - [ ] `src/features/comments/actions/delete-comment.ts`
- [ ] **5.2** Create feedback detail server actions
  - [ ] `src/features/feedback/actions/update-status.ts`
  - [ ] `src/features/feedback/actions/delete-feedback.ts`
- [ ] **5.3** Create comment components
  - [ ] `src/features/comments/components/CommentList.tsx`
  - [ ] `src/features/comments/components/CommentItem.tsx`
  - [ ] `src/features/comments/components/CommentForm.tsx` (client component)
- [ ] **5.4** Create Feedback Detail Page (`src/app/feedback/[id]/page.tsx`)
  - [ ] Full feedback description
  - [ ] Vote button
  - [ ] Comments section
  - [ ] Comment form (authenticated only)

### Verification
- [ ] Navigate to feedback detail page from list
- [ ] See full feedback description
- [ ] Post a comment (authenticated)
- [ ] Comment appears in list
- [ ] Delete own comment
- [ ] Vote/unvote from detail page
- [ ] Comment count updates correctly
- [ ] Non-authenticated users can view but not comment

---

## Phase 6: Roadmap Module (Day 8-9)

### Tasks
- [ ] **6.1** Create roadmap server actions
  - [ ] `src/features/roadmap/actions/get-roadmap.ts`
  - [ ] `src/features/roadmap/actions/create-roadmap-item.ts`
  - [ ] `src/features/roadmap/actions/update-roadmap-order.ts`
- [ ] **6.2** Create roadmap components
  - [ ] `src/features/roadmap/components/RoadmapBoard.tsx` (3 columns: Planned, In Progress, Completed)
- [ ] **6.3** Create public Roadmap Page (`src/app/roadmap/page.tsx`)
- [ ] **6.4** (Optional) Create Admin Roadmap Page with drag-and-drop (`src/app/admin/roadmap/page.tsx`)

### Verification
- [ ] Navigate to `/roadmap`
- [ ] See three columns (Planned, In Progress, Completed)
- [ ] Roadmap items display in correct columns
- [ ] Linked feedback items show "View linked feedback" link
- [ ] ETA displays if set
- [ ] Public page accessible without authentication
- [ ] (Optional) Admin can drag-and-drop items between columns

---

## Phase 7: Changelog Module (Day 9-10)

### Tasks
- [ ] **7.1** Install markdown dependencies (`npm install react-markdown remark-gfm`)
- [ ] **7.2** Create changelog server actions
  - [ ] `src/features/changelog/actions/get-changelog.ts`
  - [ ] `src/features/changelog/actions/create-changelog.ts`
- [ ] **7.3** Create changelog components
  - [ ] `src/features/changelog/components/ChangelogEntry.tsx` (with markdown rendering)
- [ ] **7.4** Create public Changelog Page with pagination (`src/app/changelog/page.tsx`)
- [ ] **7.5** Create RSS Feed Endpoint (`src/app/api/changelog/rss/route.ts`)
- [ ] **7.6** (Optional) Create Admin Changelog Editor (`src/app/admin/changelog/page.tsx`)

### Verification
- [ ] Navigate to `/changelog`
- [ ] See published changelog entries
- [ ] Markdown renders correctly (headings, lists, code blocks)
- [ ] Category badges display with correct colors
- [ ] Linked feedback items show below entry
- [ ] Pagination works (if more than 10 entries)
- [ ] RSS feed accessible at `/api/changelog/rss`
- [ ] RSS feed returns valid XML

---

## Phase 8: Admin Dashboard - Overview & Analytics (Day 10-11)

### Tasks
- [ ] **8.1** Create admin server actions
  - [ ] `src/features/admin/actions/get-stats.ts`
- [ ] **8.2** Create admin components
  - [ ] `src/features/admin/components/StatsCard.tsx`
  - [ ] `src/features/admin/components/FeedbackStatusChart.tsx`
- [ ] **8.3** Create Admin Dashboard Page (`src/app/admin/page.tsx`)
  - [ ] Stats cards (Total Feedback, Total Votes, Avg Votes)
  - [ ] Feedback status chart
  - [ ] Top voted feedback list
  - [ ] Quick actions (Manage Roadmap, Create Changelog)

### Verification
- [ ] Navigate to `/admin` as admin user
- [ ] See stats cards with correct counts
- [ ] Feedback status chart displays
- [ ] Top voted feedback list shows
- [ ] Non-admin users redirected to `/feedback`
- [ ] All quick action links work

---

## Phase 9: User Experience Enhancements (Day 11)

### Tasks
- [ ] **9.1** Create loading skeletons
  - [ ] `src/app/feedback/loading.tsx`
  - [ ] `src/app/roadmap/loading.tsx`
  - [ ] `src/app/changelog/loading.tsx`
  - [ ] `src/app/admin/loading.tsx`
- [ ] **9.2** Create error boundaries
  - [ ] `src/app/error.tsx` (global)
  - [ ] Feature-specific error.tsx files
- [ ] **9.3** Create 404 pages
  - [ ] `src/app/not-found.tsx`
  - [ ] `src/app/feedback/[id]/not-found.tsx`
- [ ] **9.4** Create empty state component (`src/components/EmptyState.tsx`)
- [ ] **9.5** Improve mobile responsiveness
  - [ ] Add hamburger menu for mobile navigation
  - [ ] Stack roadmap columns vertically on mobile
- [ ] **9.6** Improve accessibility
  - [ ] Add ARIA labels to interactive elements
  - [ ] Add focus indicators
  - [ ] Test keyboard navigation
- [ ] **9.7** Create Footer component (`src/components/Footer.tsx`)

### Verification
- [ ] Loading skeletons display during data fetch
- [ ] Error boundaries catch errors and show friendly message
- [ ] 404 page shows for invalid routes
- [ ] Empty states display when no data
- [ ] Mobile navigation works (hamburger menu)
- [ ] Roadmap columns stack on mobile
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators visible

---

## Phase 10: Testing & Quality Assurance (Day 12)

### Tasks
- [ ] **10.1** Write utility function tests (`src/lib/utils.test.ts`)
  - [ ] Test cn()
  - [ ] Test formatDate()
  - [ ] Test calculatePriorityScore()
- [ ] **10.2** Write validation schema tests (`src/lib/validations/*.test.ts`)
  - [ ] Test createFeedbackSchema
  - [ ] Test createCommentSchema
  - [ ] Test createRoadmapItemSchema
  - [ ] Test createChangelogSchema
- [ ] **10.3** Write integration tests
  - [ ] Feedback creation flow
  - [ ] Voting flow
  - [ ] Auth flow
- [ ] **10.4** Run type check and fix all errors (`npm run type-check`)
- [ ] **10.5** Run lint and fix warnings (`npm run lint`)
- [ ] **10.6** Manual testing (complete checklist in `docs/TESTING_CHECKLIST.md`)
- [ ] **10.7** Run Lighthouse audit
  - [ ] Performance > 90
  - [ ] Accessibility > 95
- [ ] **10.8** Database query optimization review
  - [ ] Check for N+1 queries
  - [ ] Verify proper use of select()
  - [ ] Review RLS performance

### Verification
- [ ] All unit tests pass: `npm test`
- [ ] Type check passes: `npm run type-check`
- [ ] Lint passes: `npm run lint`
- [ ] Manual testing checklist complete
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] Lighthouse scores meet targets

---

## Phase 11: Deployment Preparation (Day 12-13)

### Tasks
- [ ] **11.1** Create production Supabase project
  - [ ] Create project on Supabase dashboard
  - [ ] Note project URL and anon key
- [ ] **11.2** Push database to production (`npx supabase db push --linked`)
- [ ] **11.3** Create Vercel project
  - [ ] Import Git repository
  - [ ] Set framework preset to Next.js
- [ ] **11.4** Configure environment variables in Vercel
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] **11.5** (Optional) Setup Sentry for error tracking
  - [ ] `npm install @sentry/nextjs`
  - [ ] `npx @sentry/wizard@latest -i nextjs`
  - [ ] Add SENTRY_DSN to Vercel
- [ ] **11.6** Enable Vercel Analytics
- [ ] **11.7** Enable Supabase Analytics
- [ ] **11.8** Create production build locally (`npm run build && npm start`)
- [ ] **11.9** Deploy to Vercel (`git push origin main`)
- [ ] **11.10** Smoke test production environment

### Verification
- [ ] Production site accessible at Vercel URL
- [ ] Database writes succeed
- [ ] No errors in Vercel logs
- [ ] Sentry connected (if enabled)
- [ ] Analytics tracking works
- [ ] All critical user flows work in production:
  - [ ] Sign up
  - [ ] Login
  - [ ] Create feedback
  - [ ] Vote
  - [ ] Comment
  - [ ] View roadmap
  - [ ] View changelog
  - [ ] Admin dashboard (as admin)

---

## Phase 12: Documentation & Handoff (Day 13)

### Tasks
- [ ] **12.1** Create comprehensive README.md
- [ ] **12.2** Create API documentation (`docs/API.md`)
  - [ ] Document all server actions
  - [ ] Include function signatures and usage
- [ ] **12.3** Create database schema documentation (`docs/DATABASE.md`)
  - [ ] ER diagram
  - [ ] Table descriptions
  - [ ] RLS policies explained
- [ ] **12.4** Create deployment guide (`docs/DEPLOYMENT.md`)
- [ ] **12.5** Create maintenance guide (`docs/MAINTENANCE.md`)
- [ ] **12.6** Add JSDoc comments to critical functions
- [ ] **12.7** Create CHANGELOG.md for v1.0
- [ ] **12.8** Add LICENSE file
- [ ] **12.9** Final code review
  - [ ] Remove all console.log statements
  - [ ] Remove unused imports
  - [ ] Remove commented-out code
  - [ ] Check for hardcoded values

### Verification
- [ ] README is comprehensive and accurate
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment guide tested
- [ ] All critical functions have JSDoc comments
- [ ] CHANGELOG.md created
- [ ] LICENSE file added
- [ ] No debug code in production
- [ ] Local setup works from scratch following README

---

## Quick Reference

### Critical Files
1. `supabase/migrations/20260128000001_initial_schema.sql` - Database structure
2. `supabase/migrations/20260128000003_rls_policies.sql` - Security rules
3. `src/lib/supabase/server.ts` - Server-side client
4. `src/middleware.ts` - Route protection
5. `src/features/feedback/actions/get-feedback.ts` - Primary data fetching

### Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check |
| `npm run lint` | ESLint check |
| `npm test` | Run tests |
| `npx supabase studio` | Database Studio |
| `npx supabase db push` | Push migrations |

### Timeline Summary
| Phase | Days | Status |
|-------|------|--------|
| Phase 0: Initialization | Day 1 | [x] |
| Phase 1: Database | Day 2-3 | [x] |
| Phase 2: Infrastructure | Day 3-4 | [x] |
| Phase 3: Auth | Day 4-5 | [x] |
| Phase 4: Feedback | Day 5-7 | [ ] |
| Phase 5: Comments | Day 7-8 | [ ] |
| Phase 6: Roadmap | Day 8-9 | [ ] |
| Phase 7: Changelog | Day 9-10 | [ ] |
| Phase 8: Admin | Day 10-11 | [ ] |
| Phase 9: UX | Day 11 | [ ] |
| Phase 10: Testing | Day 12 | [ ] |
| Phase 11: Deploy | Day 12-13 | [ ] |
| Phase 12: Docs | Day 13 | [ ] |

---

**Last Updated**: 2026-01-28

# Urpeer.com - Implementation Plan: Zero to Production

## Overview

### Project Summary
**Urpeer.com** is a centralized feedback platform for SaaS products, providing:
- Feature voting and feedback submission
- Roadmap visualization with drag-and-drop
- Changelog publishing with markdown support
- Comment discussions and user engagement
- Admin dashboard with analytics

### Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL Database)
- **Validation:** Zod schemas
- **Drag & Drop:** @dnd-kit
- **Testing:** Vitest
- **Deployment:** Vercel + Supabase Cloud

### Current State vs Target State

**Current State:**
- ✅ Documentation (PRD.md, CLAUDE.md)
- ❌ No code implementation
- ❌ No database
- ❌ No deployment

**Target State:**
- ✅ Full-featured feedback platform
- ✅ Production deployment on Vercel
- ✅ Supabase database with RLS
- ✅ Comprehensive testing
- ✅ Complete documentation

### Timeline
**Total Duration:** 13 days (aggressive) / 26 days (part-time)
**Phases:** 12 phases from initialization to deployment

---

## Phase 0: Project Initialization & Dependencies

### Objective
Set up the Next.js 15 project with all required dependencies, configure TypeScript, and establish the directory structure.

### Tasks

#### 0.1 Initialize Next.js Project
```bash
npx create-next-app@latest urpeer.com --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

#### 0.2 Install Core Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install sonner lucide-react
npm install clsx tailwind-merge class-variance-authority
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns gray-matter react-markdown remark-gfm
```

#### 0.3 Install Dev Dependencies
```bash
npm install -D @types/node @types/react @types/react-dom
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D eslint-config-prettier prettier
npm install -D supabase
```

#### 0.4 Create Directory Structure
```bash
mkdir -p src/app
mkdir -p src/features/{feedback,roadmap,changelog,comments,auth,admin}/{components,actions,hooks,types}
mkdir -p src/components/ui
mkdir -p src/lib/{supabase,utils,validations}
mkdir -p supabase/{migrations,seed}
mkdir -p docs
mkdir -p public
```

**Files to create:**
- `src/app/layout.tsx` (root layout)
- `src/app/page.tsx` (home page placeholder)
- `src/lib/utils.ts` (cn helper)
- `.env.local.example`
- `.gitignore` (update)

#### 0.5 Configure TypeScript
Create/update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 0.6 Configure Vitest
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

#### 0.7 Initialize Supabase CLI
```bash
npx supabase init
```

#### 0.8 Create Environment Variable Template
Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Testing/Verification
- [ ] `npm run dev` runs successfully on http://localhost:3000
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes
- [ ] All directories exist
- [ ] `.env.local` created (from example)

### Dependencies
None (first phase)

---

## Phase 1: Supabase Setup & Database Schema

### Objective
Create Supabase Cloud project, define complete database schema with tables, indexes, RLS policies, and triggers.

### Tasks

#### 1.1 Create Supabase Cloud Project
1. Go to https://supabase.com/dashboard
2. Create new project: "urpeer-production"
3. Save project URL and anon key to `.env.local`
4. Link local project: `npx supabase link --project-ref your-project-ref`

#### 1.2 Create Migration: Initial Schema
**File:** `supabase/migrations/20260128000001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces Table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('admin', 'voter')),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'planned', 'in_progress', 'completed', 'closed')),
  category TEXT CHECK (category IN ('feature', 'improvement', 'bug', 'other')),
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Votes Table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- 5. Roadmap Items Table
CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  priority_score DECIMAL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  eta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Changelog Entries Table
CREATE TABLE changelog_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feature', 'improvement', 'bugfix', 'breaking')),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Changelog Feedback Links Table
CREATE TABLE changelog_feedback_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  changelog_id UUID NOT NULL REFERENCES changelog_entries(id) ON DELETE CASCADE,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(changelog_id, feedback_id)
);

-- 8. Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.3 Create Migration: Indexes
**File:** `supabase/migrations/20260128000002_indexes.sql`

```sql
-- Performance indexes
CREATE INDEX idx_feedback_workspace ON feedback(workspace_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_vote_count ON feedback(vote_count DESC);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_author ON feedback(author_id);

CREATE INDEX idx_votes_feedback ON votes(feedback_id);
CREATE INDEX idx_votes_user ON votes(user_id);

CREATE INDEX idx_roadmap_workspace ON roadmap_items(workspace_id);
CREATE INDEX idx_roadmap_status ON roadmap_items(status);
CREATE INDEX idx_roadmap_display_order ON roadmap_items(display_order);

CREATE INDEX idx_changelog_workspace ON changelog_entries(workspace_id);
CREATE INDEX idx_changelog_published ON changelog_entries(published, published_at DESC);

CREATE INDEX idx_comments_feedback ON comments(feedback_id);
CREATE INDEX idx_comments_author ON comments(author_id);
```

#### 1.4 Create Migration: RLS Policies
**File:** `supabase/migrations/20260128000003_rls_policies.sql`

```sql
-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_feedback_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies
CREATE POLICY "Workspaces are viewable by everyone" ON workspaces FOR SELECT USING (true);
CREATE POLICY "Workspaces can be created by authenticated users" ON workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Workspaces can be updated by owner" ON workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Workspaces can be deleted by owner" ON workspaces FOR DELETE USING (auth.uid() = owner_id);

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Feedback Policies
CREATE POLICY "Feedback is viewable by everyone" ON feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Authors and admins can delete feedback" ON feedback FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Votes Policies
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Roadmap Policies
CREATE POLICY "Roadmap items are viewable by everyone" ON roadmap_items FOR SELECT USING (true);
CREATE POLICY "Admins can create roadmap items" ON roadmap_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update roadmap items" ON roadmap_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete roadmap items" ON roadmap_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Changelog Policies
CREATE POLICY "Published changelog entries are viewable by everyone" ON changelog_entries FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all changelog entries" ON changelog_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can create changelog entries" ON changelog_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update changelog entries" ON changelog_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete changelog entries" ON changelog_entries FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Changelog Feedback Links Policies
CREATE POLICY "Changelog links are viewable by everyone" ON changelog_feedback_links FOR SELECT USING (true);
CREATE POLICY "Admins can create changelog links" ON changelog_feedback_links FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete changelog links" ON changelog_feedback_links FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors and admins can delete comments" ON comments FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
```

#### 1.5 Create Migration: Triggers
**File:** `supabase/migrations/20260128000004_triggers.sql`

```sql
-- Trigger 1: Update vote_count on feedback when votes change
CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback SET vote_count = vote_count + 1 WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback SET vote_count = vote_count - 1 WHERE id = OLD.feedback_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_feedback_vote_count();

-- Trigger 2: Update comment_count on feedback when comments change
CREATE OR REPLACE FUNCTION update_feedback_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback SET comment_count = comment_count + 1 WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback SET comment_count = comment_count - 1 WHERE id = OLD.feedback_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_feedback_comment_count();

-- Trigger 3: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_roadmap_updated_at BEFORE UPDATE ON roadmap_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_changelog_updated_at BEFORE UPDATE ON changelog_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.6 Create Seed Data Script
**File:** `supabase/seed/seed.sql`

```sql
-- Insert test workspace
INSERT INTO workspaces (id, name, slug, description, owner_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Test Workspace',
  'test-workspace',
  'A test workspace for development',
  'auth.users.id' -- Replace with actual user ID after signup
);

-- Insert test feedback
INSERT INTO feedback (workspace_id, title, description, status, category, author_id, vote_count)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dark mode support', 'Please add dark mode to the app', 'open', 'feature', 'auth.users.id', 15),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Export to CSV', 'Allow exporting feedback to CSV', 'planned', 'feature', 'auth.users.id', 8),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fix login bug', 'Login fails on Safari', 'in_progress', 'bug', 'auth.users.id', 23);
```

#### 1.7 Push Migrations to Database
```bash
npx supabase db push
```

### Testing/Verification
- [ ] Run `npx supabase studio` to open Supabase Studio
- [ ] Verify all 8 tables exist
- [ ] Check that each table has RLS enabled (shield icon in Studio)
- [ ] Test RLS policies by querying as non-admin user
- [ ] Verify triggers work (insert vote, check feedback.vote_count updates)
- [ ] Confirm indexes are created (check in Studio > Database > Indexes)
- [ ] Seed data appears in tables

### Dependencies
- Phase 0 (project must be initialized)

---

## Phase 2: Supabase Client & Authentication Infrastructure

### Objective
Create Supabase client factories, generate TypeScript types from database schema, create Zod validation schemas, and build utility functions.

### Tasks

#### 2.1 Create Supabase Browser Client
**File:** `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 2.2 Create Supabase Server Client
**File:** `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
      },
    }
  )
}
```

#### 2.3 Create Middleware for Auth
**File:** `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user is admin for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/feedback', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### 2.4 Generate TypeScript Types from Database
```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

**File:** `src/lib/supabase/types.ts` (re-export with convenience types)

```typescript
export type { Database } from './database.types'
import type { Database } from './database.types'

export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type RoadmapItem = Database['public']['Tables']['roadmap_items']['Row']
export type ChangelogEntry = Database['public']['Tables']['changelog_entries']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type FeedbackWithAuthor = Feedback & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  user_has_voted?: boolean
}
```

#### 2.5 Create Zod Validation Schemas
**File:** `src/lib/validations/feedback.ts`

```typescript
import { z } from 'zod'

export const createFeedbackSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['feature', 'improvement', 'bug', 'other']),
})

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(['open', 'under_review', 'planned', 'in_progress', 'completed', 'closed']),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>
```

**File:** `src/lib/validations/roadmap.ts`

```typescript
import { z } from 'zod'

export const createRoadmapItemSchema = z.object({
  feedback_id: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed']),
  eta: z.string().optional(),
})

export const updateRoadmapOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number(),
      status: z.enum(['planned', 'in_progress', 'completed']),
    })
  ),
})

export type CreateRoadmapItemInput = z.infer<typeof createRoadmapItemSchema>
export type UpdateRoadmapOrderInput = z.infer<typeof updateRoadmapOrderSchema>
```

**File:** `src/lib/validations/changelog.ts`

```typescript
import { z } from 'zod'

export const createChangelogSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  category: z.enum(['feature', 'improvement', 'bugfix', 'breaking']),
  feedback_ids: z.array(z.string().uuid()).optional(),
})

export type CreateChangelogInput = z.infer<typeof createChangelogSchema>
```

**File:** `src/lib/validations/comment.ts`

```typescript
import { z } from 'zod'

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
```

#### 2.6 Create Utility Functions
**File:** `src/lib/utils.ts` (expand existing)

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

export const calculatePriorityScore = (voteCount: number, createdAt: string): number => {
  const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  const ageFactor = 1 / (1 + ageInDays / 30) // Decay over 30 days
  return voteCount * ageFactor
}
```

**File:** `src/lib/utils/auth.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const getUser = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const requireAuth = async () => {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export const isAdmin = async (): Promise<boolean> => {
  const user = await getUser()
  if (!user) return false

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export const requireAdmin = async () => {
  const isAdminUser = await isAdmin()
  if (!isAdminUser) {
    redirect('/feedback')
  }
}
```

### Testing/Verification
- [ ] `npm run type-check` passes with no errors
- [ ] Generated database types file exists at `src/lib/supabase/database.types.ts`
- [ ] All Zod schemas validate correctly (write quick test)
- [ ] Utility functions work (test cn, formatDate, calculatePriorityScore)
- [ ] Server client can be imported without errors

### Dependencies
- Phase 1 (database must exist to generate types)

---

## Phase 3: Authentication UI & User Management

### Objective
Build login/signup pages with forms, implement authentication server actions, create profile management, and add navigation header.

### Tasks

#### 3.1 Create Auth Feature Structure
```bash
mkdir -p src/features/auth/{components,actions}
```

#### 3.2 Install Shadcn UI Components
```bash
npx shadcn@latest init
npx shadcn@latest add button input label form card toast
```

#### 3.3 Create Auth Server Actions
**File:** `src/features/auth/actions/auth.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signup = async (formData: FormData) => {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  }

  const validated = signupSchema.parse(data)

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: validated.email,
      full_name: validated.fullName,
      role: 'voter',
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/feedback')
}

export const login = async (formData: FormData) => {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validated = loginSchema.parse(data)

  const { error } = await supabase.auth.signInWithPassword(validated)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/feedback')
}

export const logout = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

#### 3.4 Create Login Page
**File:** `src/app/login/page.tsx`

```typescript
import { login } from '@/features/auth/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <p className="text-center text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3.5 Create Signup Page
**File:** `src/app/signup/page.tsx`

```typescript
import { signup } from '@/features/auth/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3.6 Create Header Navigation Component
**File:** `src/components/Header.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/features/auth/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const Header = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Urpeer
          </Link>
          <nav className="flex gap-4">
            <Link href="/feedback" className="text-sm hover:underline">
              Feedback
            </Link>
            <Link href="/roadmap" className="text-sm hover:underline">
              Roadmap
            </Link>
            <Link href="/changelog" className="text-sm hover:underline">
              Changelog
            </Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm hover:underline">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">{profile?.full_name}</span>
              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
```

#### 3.7 Update Root Layout
**File:** `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Urpeer - Feedback Platform',
  description: 'Centralized feedback platform for SaaS products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

#### 3.8 Create Profile Management Page
**File:** `src/app/profile/page.tsx`

```typescript
import { requireAuth } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

const updateProfile = async (formData: FormData) => {
  'use server'
  const user = await requireAuth()
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string

  await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)

  revalidatePath('/profile')
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                required
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Testing/Verification
- [ ] Navigate to `/signup` and create a new account
- [ ] Verify profile record created in Supabase Studio
- [ ] Login with created account at `/login`
- [ ] Header shows user name and logout button
- [ ] Logout button works and redirects to login
- [ ] Navigate to `/profile` and update full name
- [ ] Non-authenticated users redirected to login
- [ ] Toast notifications show for errors

### Dependencies
- Phase 2 (auth infrastructure must exist)

---

## Phase 4: Feedback Board - Core Feature

### Objective
Build the main feedback list page with voting, filtering, sorting, and creation dialog.

### Tasks

#### 4.1 Install Additional Shadcn Components
```bash
npx shadcn@latest add dialog select badge skeleton
```

#### 4.2 Create Feedback Server Actions
**File:** `src/features/feedback/actions/get-feedback.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { FeedbackWithAuthor } from '@/lib/supabase/types'

type GetFeedbackParams = {
  status?: string
  category?: string
  sortBy?: 'votes' | 'recent'
}

export const getFeedback = async (params: GetFeedbackParams = {}) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('feedback')
    .select('*, profiles(id, full_name, avatar_url)')

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params.sortBy === 'votes') {
    query = query.order('vote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: feedback, error } = await query

  if (error) throw error

  // Check if user has voted on each feedback
  if (user) {
    const { data: userVotes } = await supabase
      .from('votes')
      .select('feedback_id')
      .eq('user_id', user.id)

    const votedFeedbackIds = new Set(userVotes?.map((v) => v.feedback_id))

    return feedback?.map((f) => ({
      ...f,
      user_has_voted: votedFeedbackIds.has(f.id),
    })) as FeedbackWithAuthor[]
  }

  return feedback as FeedbackWithAuthor[]
}
```

**File:** `src/features/feedback/actions/create-feedback.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { createFeedbackSchema } from '@/lib/validations/feedback'
import { revalidatePath } from 'next/cache'

export const createFeedback = async (formData: FormData) => {
  const user = await requireAuth()
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
  }

  const validated = createFeedbackSchema.parse(data)

  const { error } = await supabase.from('feedback').insert({
    ...validated,
    author_id: user.id,
    workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // TODO: Make dynamic
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/feedback')
  return { success: true }
}
```

**File:** `src/features/feedback/actions/vote.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export const toggleVote = async (feedbackId: string) => {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('feedback_id', feedbackId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // Remove vote
    await supabase.from('votes').delete().eq('id', existingVote.id)
  } else {
    // Add vote
    await supabase.from('votes').insert({
      feedback_id: feedbackId,
      user_id: user.id,
    })
  }

  revalidatePath('/feedback')
  return { success: true }
}
```

#### 4.3 Create Feedback Components
**File:** `src/features/feedback/components/FeedbackCard.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { FeedbackWithAuthor } from '@/lib/supabase/types'
import { formatRelativeTime } from '@/lib/utils'
import { VoteButton } from './VoteButton'
import Link from 'next/link'

type FeedbackCardProps = {
  feedback: FeedbackWithAuthor
}

export const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  const statusColors = {
    open: 'bg-gray-500',
    under_review: 'bg-blue-500',
    planned: 'bg-purple-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    closed: 'bg-red-500',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4">
        <VoteButton
          feedbackId={feedback.id}
          voteCount={feedback.vote_count}
          hasVoted={feedback.user_has_voted || false}
        />
        <div className="flex-1">
          <Link href={`/feedback/${feedback.id}`}>
            <h3 className="text-lg font-semibold hover:underline">{feedback.title}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {feedback.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={statusColors[feedback.status]}>{feedback.status}</Badge>
            {feedback.category && (
              <Badge variant="outline">{feedback.category}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              by {feedback.profiles?.full_name} · {formatRelativeTime(feedback.created_at)}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
```

**File:** `src/features/feedback/components/VoteButton.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { ArrowBigUp } from 'lucide-react'
import { toggleVote } from '../actions/vote'
import { useTransition } from 'react'
import { toast } from 'sonner'

type VoteButtonProps = {
  feedbackId: string
  voteCount: number
  hasVoted: boolean
}

export const VoteButton = ({ feedbackId, voteCount, hasVoted }: VoteButtonProps) => {
  const [isPending, startTransition] = useTransition()

  const handleVote = () => {
    startTransition(async () => {
      const result = await toggleVote(feedbackId)
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      variant={hasVoted ? 'default' : 'outline'}
      size="sm"
      className="flex flex-col h-auto py-2 px-3"
      onClick={handleVote}
      disabled={isPending}
    >
      <ArrowBigUp className="h-4 w-4" />
      <span className="text-xs font-semibold">{voteCount}</span>
    </Button>
  )
}
```

**File:** `src/features/feedback/components/NewFeedbackDialog.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFeedback } from '../actions/create-feedback'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const NewFeedbackDialog = () => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createFeedback(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Feedback created successfully')
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Feedback</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>Share your ideas and suggestions</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

#### 4.4 Create Feedback Page
**File:** `src/app/feedback/page.tsx`

```typescript
import { getFeedback } from '@/features/feedback/actions/get-feedback'
import { FeedbackCard } from '@/features/feedback/components/FeedbackCard'
import { NewFeedbackDialog } from '@/features/feedback/components/NewFeedbackDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SearchParams = {
  status?: string
  category?: string
  sortBy?: 'votes' | 'recent'
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const feedback = await getFeedback(searchParams)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <NewFeedbackDialog />
      </div>

      <div className="mb-6 flex gap-4">
        <Select name="status" defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select name="sortBy" defaultValue="recent">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {feedback.map((item) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
      </div>
    </div>
  )
}
```

### Testing/Verification
- [ ] Navigate to `/feedback` and see list of feedback
- [ ] Click "New Feedback" button and create feedback
- [ ] Vote on feedback item (count increments)
- [ ] Unvote (count decrements)
- [ ] Filter by status (dropdown works)
- [ ] Sort by votes vs recent
- [ ] Click feedback title to navigate to detail page (will be Phase 5)
- [ ] Non-authenticated users can view but not create/vote

### Dependencies
- Phase 3 (auth must be complete)

---

## Phase 5: Feedback Detail Page & Comments

### Objective
Create feedback detail page with full description, comments section, and admin moderation actions.

### Tasks

#### 5.1 Create Comment Server Actions
**File:** `src/features/comments/actions/get-comments.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const getComments = async (feedbackId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('feedback_id', feedbackId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
```

**File:** `src/features/comments/actions/create-comment.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { createCommentSchema } from '@/lib/validations/comment'
import { revalidatePath } from 'next/cache'

export const createComment = async (feedbackId: string, formData: FormData) => {
  const user = await requireAuth()
  const supabase = await createClient()

  const data = {
    content: formData.get('content') as string,
  }

  const validated = createCommentSchema.parse(data)

  const { error } = await supabase.from('comments').insert({
    feedback_id: feedbackId,
    author_id: user.id,
    content: validated.content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}
```

**File:** `src/features/comments/actions/delete-comment.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export const deleteComment = async (commentId: string, feedbackId: string) => {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}
```

#### 5.2 Create Feedback Detail Server Actions
**File:** `src/features/feedback/actions/update-status.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

export const updateFeedbackStatus = async (feedbackId: string, status: string) => {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('feedback')
    .update({ status })
    .eq('id', feedbackId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/feedback/${feedbackId}`)
  return { success: true }
}
```

**File:** `src/features/feedback/actions/delete-feedback.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { redirect } from 'next/navigation'

export const deleteFeedback = async (feedbackId: string) => {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('feedback').delete().eq('id', feedbackId)

  if (error) {
    return { error: error.message }
  }

  redirect('/feedback')
}
```

#### 5.3 Create Comment Components
**File:** `src/features/comments/components/CommentList.tsx`

```typescript
import { getComments } from '../actions/get-comments'
import { CommentItem } from './CommentItem'

type CommentListProps = {
  feedbackId: string
}

export const CommentList = async ({ feedbackId }: CommentListProps) => {
  const comments = await getComments(feedbackId)

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} feedbackId={feedbackId} />
      ))}
    </div>
  )
}
```

**File:** `src/features/comments/components/CommentItem.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { getUser } from '@/lib/utils/auth'
import { deleteComment } from '../actions/delete-comment'
import { Trash2 } from 'lucide-react'

type CommentItemProps = {
  comment: any
  feedbackId: string
}

export const CommentItem = async ({ comment, feedbackId }: CommentItemProps) => {
  const user = await getUser()
  const canDelete = user?.id === comment.author_id

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.profiles?.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
          </div>
          {canDelete && (
            <form action={deleteComment.bind(null, comment.id, feedbackId)}>
              <Button variant="ghost" size="sm" type="submit">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

**File:** `src/features/comments/components/CommentForm.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '../actions/create-comment'
import { useTransition } from 'react'
import { toast } from 'sonner'

type CommentFormProps = {
  feedbackId: string
}

export const CommentForm = ({ feedbackId }: CommentFormProps) => {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createComment(feedbackId, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Comment posted')
        // Reset form
        const form = document.querySelector('form') as HTMLFormElement
        form?.reset()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Textarea name="content" placeholder="Add a comment..." rows={3} required />
      <Button type="submit" disabled={isPending}>
        Post Comment
      </Button>
    </form>
  )
}
```

#### 5.4 Install Textarea Component
```bash
npx shadcn@latest add textarea
```

#### 5.5 Create Feedback Detail Page
**File:** `src/app/feedback/[id]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { VoteButton } from '@/features/feedback/components/VoteButton'
import { CommentList } from '@/features/comments/components/CommentList'
import { CommentForm } from '@/features/comments/components/CommentForm'
import { formatRelativeTime } from '@/lib/utils'
import { getUser, isAdmin } from '@/lib/utils/auth'
import { MessageSquare } from 'lucide-react'

export default async function FeedbackDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const user = await getUser()
  const isAdminUser = await isAdmin()

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*, profiles(id, full_name, avatar_url)')
    .eq('id', params.id)
    .single()

  if (!feedback) {
    notFound()
  }

  let hasVoted = false
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('id')
      .eq('feedback_id', feedback.id)
      .eq('user_id', user.id)
      .single()
    hasVoted = !!vote
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <VoteButton
              feedbackId={feedback.id}
              voteCount={feedback.vote_count}
              hasVoted={hasVoted}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{feedback.title}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge>{feedback.status}</Badge>
                {feedback.category && <Badge variant="outline">{feedback.category}</Badge>}
                <span className="text-sm text-muted-foreground">
                  by {feedback.profiles?.full_name} · {formatRelativeTime(feedback.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{feedback.description}</p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            Comments ({feedback.comment_count})
          </h2>
        </div>

        {user ? (
          <div className="mb-6">
            <CommentForm feedbackId={feedback.id} />
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">
            Please login to comment
          </p>
        )}

        <CommentList feedbackId={feedback.id} />
      </div>
    </div>
  )
}
```

### Testing/Verification
- [ ] Navigate to feedback detail page from list
- [ ] See full feedback description
- [ ] Post a comment (authenticated)
- [ ] Comment appears in list
- [ ] Delete own comment
- [ ] Vote/unvote from detail page
- [ ] Comment count updates correctly
- [ ] Non-authenticated users can view but not comment

### Dependencies
- Phase 4 (feedback list must exist)

---

## Phase 6: Roadmap Module

### Objective
Build public roadmap page with three-column board (Planned, In Progress, Completed) and admin drag-and-drop interface.

### Tasks

#### 6.1 Create Roadmap Server Actions
**File:** `src/features/roadmap/actions/get-roadmap.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { calculatePriorityScore } from '@/lib/utils'

export const getRoadmap = async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roadmap_items')
    .select('*, feedback(*)')
    .order('display_order', { ascending: true })

  if (error) throw error

  // Calculate priority scores for items with linked feedback
  const withScores = data.map((item) => ({
    ...item,
    priority_score: item.feedback
      ? calculatePriorityScore(item.feedback.vote_count, item.feedback.created_at)
      : 0,
  }))

  return withScores
}
```

**File:** `src/features/roadmap/actions/create-roadmap-item.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { createRoadmapItemSchema } from '@/lib/validations/roadmap'
import { revalidatePath } from 'next/cache'

export const createRoadmapItem = async (formData: FormData) => {
  await requireAdmin()
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as string,
    feedback_id: formData.get('feedback_id') as string | null,
    eta: formData.get('eta') as string | null,
  }

  const validated = createRoadmapItemSchema.parse(data)

  const { error } = await supabase.from('roadmap_items').insert({
    ...validated,
    workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // TODO: Make dynamic
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/roadmap')
  return { success: true }
}
```

**File:** `src/features/roadmap/actions/update-roadmap-order.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

type RoadmapUpdate = {
  id: string
  status: string
  display_order: number
}

export const updateRoadmapOrder = async (updates: RoadmapUpdate[]) => {
  await requireAdmin()
  const supabase = await createClient()

  // Update each item
  for (const update of updates) {
    await supabase
      .from('roadmap_items')
      .update({
        status: update.status,
        display_order: update.display_order,
      })
      .eq('id', update.id)
  }

  revalidatePath('/roadmap')
  return { success: true }
}
```

#### 6.2 Create Roadmap Components
**File:** `src/features/roadmap/components/RoadmapBoard.tsx`

```typescript
import { getRoadmap } from '../actions/get-roadmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const RoadmapBoard = async () => {
  const items = await getRoadmap()

  const planned = items.filter((i) => i.status === 'planned')
  const inProgress = items.filter((i) => i.status === 'in_progress')
  const completed = items.filter((i) => i.status === 'completed')

  const Column = ({ title, items, color }: { title: string; items: any[]; color: string }) => (
    <div className="flex-1">
      <div className="mb-4 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="mb-2 text-sm text-muted-foreground">{item.description}</p>
              )}
              {item.eta && (
                <p className="text-xs text-muted-foreground">ETA: {item.eta}</p>
              )}
              {item.feedback && (
                <Link
                  href={`/feedback/${item.feedback.id}`}
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  View linked feedback
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex gap-6">
      <Column title="Planned" items={planned} color="bg-purple-500" />
      <Column title="In Progress" items={inProgress} color="bg-yellow-500" />
      <Column title="Completed" items={completed} color="bg-green-500" />
    </div>
  )
}
```

#### 6.3 Create Roadmap Page
**File:** `src/app/roadmap/page.tsx`

```typescript
import { RoadmapBoard } from '@/features/roadmap/components/RoadmapBoard'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RoadmapPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Roadmap</h1>
        <p className="mt-2 text-muted-foreground">
          See what we're working on and what's coming next
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <RoadmapBoard />
      </Suspense>
    </div>
  )
}
```

#### 6.4 Optional: Admin Drag-and-Drop Interface
**File:** `src/app/admin/roadmap/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { updateRoadmapOrder } from '@/features/roadmap/actions/update-roadmap-order'
import { toast } from 'sonner'

// Implementation of drag-and-drop with @dnd-kit
// This is a complex component - implement if time allows
// Otherwise, roadmap order can be managed via direct database updates
```

### Testing/Verification
- [ ] Navigate to `/roadmap`
- [ ] See three columns (Planned, In Progress, Completed)
- [ ] Roadmap items display in correct columns
- [ ] Linked feedback items show "View linked feedback" link
- [ ] ETA displays if set
- [ ] Public page accessible without authentication
- [ ] (Optional) Admin can drag-and-drop items between columns

### Dependencies
- Phase 4 (feedback module for linking)

---

## Phase 7: Changelog Module

### Objective
Build changelog page with pagination, markdown rendering, RSS feed, and admin editor.

### Tasks

#### 7.1 Install Markdown Dependencies
```bash
npm install react-markdown remark-gfm gray-matter
```

#### 7.2 Create Changelog Server Actions
**File:** `src/features/changelog/actions/get-changelog.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const getChangelog = async (page = 1, limit = 10) => {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('changelog_entries')
    .select('*, profiles(full_name), changelog_feedback_links(feedback(*))', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    entries: data,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
```

**File:** `src/features/changelog/actions/create-changelog.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'
import { createChangelogSchema } from '@/lib/validations/changelog'
import { revalidatePath } from 'next/cache'

export const createChangelog = async (formData: FormData) => {
  const user = await requireAdmin()
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    category: formData.get('category') as string,
    feedback_ids: formData.getAll('feedback_ids') as string[],
  }

  const validated = createChangelogSchema.parse(data)

  // Create changelog entry
  const { data: changelog, error } = await supabase
    .from('changelog_entries')
    .insert({
      title: validated.title,
      content: validated.content,
      category: validated.category,
      workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // TODO: Make dynamic
      author_id: user.id,
      published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Link feedback items if provided
  if (validated.feedback_ids && validated.feedback_ids.length > 0) {
    const links = validated.feedback_ids.map((feedbackId) => ({
      changelog_id: changelog.id,
      feedback_id: feedbackId,
    }))

    await supabase.from('changelog_feedback_links').insert(links)
  }

  revalidatePath('/changelog')
  return { success: true, id: changelog.id }
}
```

#### 7.3 Create Changelog Components
**File:** `src/features/changelog/components/ChangelogEntry.tsx`

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

type ChangelogEntryProps = {
  entry: any
}

const categoryColors = {
  feature: 'bg-blue-500',
  improvement: 'bg-green-500',
  bugfix: 'bg-yellow-500',
  breaking: 'bg-red-500',
}

export const ChangelogEntry = ({ entry }: ChangelogEntryProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{entry.title}</h2>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={categoryColors[entry.category]}>{entry.category}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.published_at)} · by {entry.profiles?.full_name}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>
        </div>

        {entry.changelog_feedback_links && entry.changelog_feedback_links.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold">Related Feedback:</h3>
            <div className="flex flex-wrap gap-2">
              {entry.changelog_feedback_links.map((link: any) => (
                <Link
                  key={link.feedback.id}
                  href={`/feedback/${link.feedback.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  {link.feedback.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### 7.4 Create Changelog Page with Pagination
**File:** `src/app/changelog/page.tsx`

```typescript
import { getChangelog } from '@/features/changelog/actions/get-changelog'
import { ChangelogEntry } from '@/features/changelog/components/ChangelogEntry'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const { entries, totalPages } = await getChangelog(page)

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="mt-2 text-muted-foreground">
            Latest updates and improvements
          </p>
        </div>
        <Link href="/changelog/rss">
          <Button variant="outline" size="sm">
            RSS Feed
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {entries.map((entry) => (
          <ChangelogEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/changelog?page=${page - 1}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/changelog?page=${page + 1}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
```

#### 7.5 Create RSS Feed Endpoint
**File:** `src/app/api/changelog/rss/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('changelog_entries')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Urpeer Changelog</title>
    <link>https://urpeer.com/changelog</link>
    <description>Latest updates and improvements</description>
    ${entries
      ?.map(
        (entry) => `
    <item>
      <title>${entry.title}</title>
      <link>https://urpeer.com/changelog</link>
      <description>${entry.content.substring(0, 200)}...</description>
      <pubDate>${new Date(entry.published_at).toUTCString()}</pubDate>
    </item>
    `
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

### Testing/Verification
- [ ] Navigate to `/changelog`
- [ ] See published changelog entries
- [ ] Markdown renders correctly (headings, lists, code blocks)
- [ ] Category badges display with correct colors
- [ ] Linked feedback items show below entry
- [ ] Pagination works (if more than 10 entries)
- [ ] RSS feed accessible at `/changelog/rss`
- [ ] RSS feed returns valid XML

### Dependencies
- Phase 4 (feedback module for linking)

---

## Phase 8: Admin Dashboard - Overview & Analytics

### Objective
Build protected admin dashboard with analytics, feedback management table, and user statistics.

### Tasks

#### 8.1 Create Admin Server Actions
**File:** `src/features/admin/actions/get-stats.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/utils/auth'

export const getStats = async () => {
  await requireAdmin()
  const supabase = await createClient()

  // Total feedback count
  const { count: feedbackCount } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })

  // Total votes count
  const { count: votesCount } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })

  // Feedback by status
  const { data: statusCounts } = await supabase
    .from('feedback')
    .select('status')
    .then(({ data }) => {
      const counts: Record<string, number> = {}
      data?.forEach((item) => {
        counts[item.status] = (counts[item.status] || 0) + 1
      })
      return { data: counts }
    })

  // Top voted feedback
  const { data: topFeedback } = await supabase
    .from('feedback')
    .select('id, title, vote_count')
    .order('vote_count', { ascending: false })
    .limit(5)

  return {
    feedbackCount: feedbackCount || 0,
    votesCount: votesCount || 0,
    statusCounts: statusCounts || {},
    topFeedback: topFeedback || [],
  }
}
```

#### 8.2 Create Admin Components
**File:** `src/features/admin/components/StatsCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatsCardProps = {
  title: string
  value: number | string
  description?: string
}

export const StatsCard = ({ title, value, description }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
```

**File:** `src/features/admin/components/FeedbackStatusChart.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type FeedbackStatusChartProps = {
  statusCounts: Record<string, number>
}

export const FeedbackStatusChart = ({ statusCounts }: FeedbackStatusChartProps) => {
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => {
            const percentage = ((count / total) * 100).toFixed(1)
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{status}</Badge>
                  <span className="text-sm">{count} items</span>
                </div>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 8.3 Create Admin Dashboard Page
**File:** `src/app/admin/page.tsx`

```typescript
import { requireAdmin } from '@/lib/utils/auth'
import { getStats } from '@/features/admin/actions/get-stats'
import { StatsCard } from '@/features/admin/components/StatsCard'
import { FeedbackStatusChart } from '@/features/admin/components/FeedbackStatusChart'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getStats()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage feedback and view analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Feedback"
          value={stats.feedbackCount}
          description="All feedback submissions"
        />
        <StatsCard
          title="Total Votes"
          value={stats.votesCount}
          description="Votes cast by users"
        />
        <StatsCard
          title="Avg Votes/Feedback"
          value={(stats.votesCount / stats.feedbackCount || 0).toFixed(1)}
          description="Average engagement"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <FeedbackStatusChart statusCounts={stats.statusCounts} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Top Voted Feedback</h2>
          {stats.topFeedback.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <Link
                href={`/feedback/${item.id}`}
                className="text-sm hover:underline"
              >
                {item.title}
              </Link>
              <span className="text-sm font-semibold">{item.vote_count} votes</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/admin/roadmap">
            <Button>Manage Roadmap</Button>
          </Link>
          <Link href="/admin/changelog">
            <Button>Create Changelog</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Testing/Verification
- [ ] Navigate to `/admin` as admin user
- [ ] See stats cards with correct counts
- [ ] Feedback status chart displays
- [ ] Top voted feedback list shows
- [ ] Non-admin users redirected to `/feedback`
- [ ] All quick action links work

### Dependencies
- Phase 3 (auth), Phase 4 (feedback), Phase 6 (roadmap), Phase 7 (changelog)

---

## Phase 9: User Experience Enhancements

### Objective
Add loading states, error boundaries, responsive design improvements, accessibility features, and empty states.

### Tasks

#### 9.1 Create Loading Skeletons
**File:** `src/app/feedback/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedbackLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}
```

**File:** `src/app/roadmap/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function RoadmapLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="flex gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 space-y-3">
            <Skeleton className="h-8 w-32" />
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-24 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### 9.2 Create Error Boundaries
**File:** `src/app/error.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

**File:** `src/app/not-found.tsx`

```typescript
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <Link href="/feedback" className="mt-8">
        <Button>Go to Feedback</Button>
      </Link>
    </div>
  )
}
```

#### 9.3 Add Empty State Components
**File:** `src/components/EmptyState.tsx`

```typescript
import { FileQuestion } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
```

Update feedback page to show empty state:
```typescript
// In src/app/feedback/page.tsx
{feedback.length === 0 ? (
  <EmptyState
    title="No feedback yet"
    description="Be the first to submit feedback"
    action={<NewFeedbackDialog />}
  />
) : (
  <div className="space-y-4">
    {feedback.map((item) => (
      <FeedbackCard key={item.id} feedback={item} />
    ))}
  </div>
)}
```

#### 9.4 Improve Mobile Responsiveness
Update Header component:
```typescript
// Add mobile hamburger menu
// Use Shadcn Sheet component for mobile navigation
```

Update Roadmap for mobile:
```typescript
// Stack columns vertically on mobile
// In src/features/roadmap/components/RoadmapBoard.tsx
<div className="flex flex-col gap-6 md:flex-row">
```

#### 9.5 Add Accessibility Improvements
- Add ARIA labels to all interactive elements
- Ensure keyboard navigation works for all forms
- Add focus indicators to buttons and links
- Test with screen reader

#### 9.6 Create Footer Component
**File:** `src/components/Footer.tsx`

```typescript
export const Footer = () => {
  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © 2026 Urpeer. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="/changelog" className="text-sm hover:underline">
            Changelog
          </a>
          <a href="/roadmap" className="text-sm hover:underline">
            Roadmap
          </a>
        </div>
      </div>
    </footer>
  )
}
```

Add to layout.tsx

### Testing/Verification
- [ ] Loading skeletons display during data fetch
- [ ] Error boundaries catch errors and show friendly message
- [ ] 404 page shows for invalid routes
- [ ] Empty states display when no data
- [ ] Mobile navigation works (hamburger menu)
- [ ] Roadmap columns stack on mobile
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators visible

### Dependencies
- All previous phases (enhances existing features)

---

## Phase 10: Testing & Quality Assurance

### Objective
Write unit tests, integration tests, run type-check and lint, perform manual testing, and optimize performance.

### Tasks

#### 10.1 Write Utility Function Tests
**File:** `src/lib/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { cn, formatDate, calculatePriorityScore } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-01-28')
    expect(formatDate(date)).toMatch(/Jan 28, 2026/)
  })
})

describe('calculatePriorityScore', () => {
  it('calculates priority score', () => {
    const score = calculatePriorityScore(10, '2026-01-01')
    expect(score).toBeGreaterThan(0)
  })
})
```

#### 10.2 Write Validation Schema Tests
**File:** `src/lib/validations/feedback.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createFeedbackSchema } from './feedback'

describe('createFeedbackSchema', () => {
  it('validates correct feedback data', () => {
    const data = {
      title: 'Test feedback',
      description: 'This is a test description',
      category: 'feature' as const,
    }
    expect(() => createFeedbackSchema.parse(data)).not.toThrow()
  })

  it('rejects short title', () => {
    const data = {
      title: 'AB',
      description: 'This is a test description',
      category: 'feature' as const,
    }
    expect(() => createFeedbackSchema.parse(data)).toThrow()
  })
})
```

#### 10.3 Write Integration Tests
**File:** `src/features/feedback/__tests__/feedback-flow.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
// Test complete feedback creation flow
// Mock Supabase client and test server actions
```

#### 10.4 Run Type Check
```bash
npm run type-check
```
Fix all TypeScript errors

#### 10.5 Run Lint
```bash
npm run lint
```
Fix all ESLint warnings

#### 10.6 Manual Testing Checklist
Create `docs/TESTING_CHECKLIST.md`:

```markdown
# Manual Testing Checklist

## Authentication
- [ ] User can sign up with email/password
- [ ] User can login
- [ ] User can logout
- [ ] Profile page shows correct data
- [ ] Profile updates save correctly

## Feedback
- [ ] List page shows all feedback
- [ ] Can create new feedback
- [ ] Can vote/unvote on feedback
- [ ] Vote count updates correctly
- [ ] Filter by status works
- [ ] Sort by votes/recent works
- [ ] Detail page shows full feedback
- [ ] Comments display correctly
- [ ] Can post comment
- [ ] Can delete own comment

## Roadmap
- [ ] Public roadmap displays
- [ ] Items in correct columns
- [ ] Linked feedback shows

## Changelog
- [ ] Published entries display
- [ ] Markdown renders correctly
- [ ] Pagination works
- [ ] RSS feed accessible

## Admin
- [ ] Admin dashboard shows stats
- [ ] Non-admin redirected
- [ ] Can create changelog entry
- [ ] Can manage roadmap

## Edge Cases
- [ ] Non-authenticated users can view public pages
- [ ] Non-authenticated users redirected from protected pages
- [ ] Empty states display
- [ ] Error states handled gracefully
```

#### 10.7 Performance Optimization
- Review all database queries
- Add indexes where needed (already done in Phase 1)
- Optimize images (use Next.js Image component)
- Run Lighthouse audit: `npm run build && npm start`
  - Target: Performance >90, Accessibility >95

#### 10.8 Database Query Review
- Check N+1 queries
- Ensure proper use of `select` to limit data
- Verify RLS policies don't cause performance issues

### Testing/Verification
- [ ] All unit tests pass: `npm test`
- [ ] Type check passes: `npm run type-check`
- [ ] Lint passes: `npm run lint`
- [ ] Manual testing checklist complete
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] Lighthouse scores meet targets

### Dependencies
- All previous phases (tests existing features)

---

## Phase 11: Deployment Preparation

### Objective
Deploy to Vercel with production Supabase database, configure environment variables, enable monitoring, and smoke test.

### Tasks

#### 11.1 Create Production Supabase Project
1. Go to https://supabase.com/dashboard
2. Create new project: "urpeer-production"
3. Note project URL and anon key
4. Link local to production: `npx supabase link --project-ref production-ref`

#### 11.2 Push Database to Production
```bash
npx supabase db push --linked
```

Verify in Supabase Studio that all tables, RLS policies, indexes exist

#### 11.3 Create Vercel Project
1. Go to https://vercel.com
2. Import Git repository
3. Framework Preset: Next.js
4. Root Directory: ./

#### 11.4 Configure Environment Variables in Vercel
Add the following environment variables in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 11.5 Optional: Setup Sentry for Error Tracking
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add `SENTRY_DSN` to Vercel environment variables

#### 11.6 Enable Vercel Analytics
- Go to Vercel project settings
- Enable Vercel Analytics
- Enable Web Vitals tracking

#### 11.7 Enable Supabase Analytics
- In Supabase dashboard, go to Settings > Analytics
- Enable analytics and API logging

#### 11.8 Optional: Configure Rate Limiting
Create middleware rate limiting or use Vercel Edge Config

#### 11.9 Create Production Build Locally
```bash
npm run build
npm start
```

Test production build locally before deploying

#### 11.10 Deploy to Vercel
```bash
git push origin main
```

Vercel auto-deploys on push

#### 11.11 Smoke Test Production
- [ ] Visit production URL
- [ ] Sign up new account
- [ ] Create feedback
- [ ] Vote on feedback
- [ ] Post comment
- [ ] View roadmap
- [ ] View changelog
- [ ] Login as admin (manually set role in Supabase)
- [ ] Access admin dashboard
- [ ] Create changelog entry
- [ ] Check Sentry (if enabled) for errors
- [ ] Check Vercel Analytics for traffic

### Testing/Verification
- [ ] Production site accessible at Vercel URL
- [ ] Database writes succeed
- [ ] No errors in Vercel logs
- [ ] Sentry connected (if enabled)
- [ ] Analytics tracking works
- [ ] All critical user flows work in production

### Dependencies
- Phase 10 (must pass tests before deploy)

---

## Phase 12: Documentation & Handoff

### Objective
Create comprehensive documentation for setup, API usage, database schema, deployment, and maintenance.

### Tasks

#### 12.1 Create Comprehensive README
**File:** `README.md`

```markdown
# Urpeer.com - Feedback Platform

A centralized feedback platform for SaaS products with voting, roadmap, and changelog features.

## Features

- 📝 Feedback submission and voting
- 🗳️ Real-time vote counting
- 🗺️ Public roadmap visualization
- 📰 Changelog with markdown support
- 💬 Comment discussions
- 📊 Admin analytics dashboard
- 🔐 Supabase authentication
- 🎨 Modern UI with Shadcn/ui

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL)
- **UI Components:** Shadcn/ui
- **Validation:** Zod
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/urpeer.com.git
cd urpeer.com
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your Supabase credentials.

4. Initialize Supabase:
\`\`\`bash
npx supabase start
npx supabase db push
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000

## Project Structure

\`\`\`
src/
├── app/                 # Next.js app router pages
├── features/            # Feature-based modules
│   ├── feedback/
│   ├── roadmap/
│   ├── changelog/
│   ├── comments/
│   ├── auth/
│   └── admin/
├── components/          # Shared UI components
│   └── ui/             # Shadcn components
└── lib/                # Utilities and configurations
    ├── supabase/
    ├── validations/
    └── utils/
\`\`\`

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
```

#### 12.2 Create API Documentation
**File:** `docs/API.md`

Document all server actions with:
- Function signatures
- Parameters
- Return types
- Usage examples

#### 12.3 Create Database Schema Documentation
**File:** `docs/DATABASE.md`

Include:
- ER diagram (use Supabase Studio to export)
- Table descriptions
- Column types and constraints
- RLS policies explained
- Trigger descriptions

#### 12.4 Create Deployment Guide
**File:** `docs/DEPLOYMENT.md`

Step-by-step guide for:
- Setting up Supabase Cloud
- Configuring Vercel
- Environment variables
- Running migrations
- Verifying deployment

#### 12.5 Create Maintenance Guide
**File:** `docs/MAINTENANCE.md`

Include:
- How to backup database
- How to roll back migrations
- How to monitor errors
- How to update dependencies
- Common troubleshooting

#### 12.6 Add JSDoc Comments to Critical Functions
Add documentation comments to:
- All server actions
- Complex utility functions
- Custom hooks

#### 12.7 Create CHANGELOG
**File:** `CHANGELOG.md`

```markdown
# Changelog

## [1.0.0] - 2026-02-10

### Added
- Initial release
- Feedback submission and voting
- Roadmap visualization
- Changelog with markdown support
- Comment system
- Admin dashboard
- User authentication
```

#### 12.8 Add LICENSE
**File:** `LICENSE`

Add MIT License or your preferred license

#### 12.9 Final Code Review
- Remove all `console.log` statements
- Remove unused imports
- Remove commented-out code
- Ensure consistent formatting
- Check for hardcoded values (move to env)

#### 12.10 Create Contributing Guide
**File:** `CONTRIBUTING.md`

Include:
- How to set up development environment
- Coding standards from CLAUDE.md
- How to submit pull requests
- How to report bugs

### Testing/Verification
- [ ] README is comprehensive and accurate
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment guide tested by following steps
- [ ] All critical functions have JSDoc comments
- [ ] CHANGELOG.md created
- [ ] LICENSE file added
- [ ] No debug code or console.logs in production
- [ ] Code review checklist complete

### Dependencies
- All previous phases (documents everything)

---

## Quick Reference

### Timeline Matrix

| Phase | Duration | Start Day | End Day | Critical Path |
|-------|----------|-----------|---------|---------------|
| 0: Initialization | 1 day | Day 1 | Day 1 | ✓ |
| 1: Database Setup | 2 days | Day 2 | Day 3 | ✓ |
| 2: Infrastructure | 1 day | Day 3 | Day 4 | ✓ |
| 3: Authentication | 1 day | Day 4 | Day 5 | ✓ |
| 4: Feedback Core | 2 days | Day 5 | Day 7 | ✓ |
| 5: Comments | 1 day | Day 7 | Day 8 | ✓ |
| 6: Roadmap | 1 day | Day 8 | Day 9 | - |
| 7: Changelog | 1 day | Day 9 | Day 10 | - |
| 8: Admin Dashboard | 1 day | Day 10 | Day 11 | - |
| 9: UX Enhancements | 1 day | Day 11 | Day 11 | - |
| 10: Testing | 1 day | Day 12 | Day 12 | ✓ |
| 11: Deployment | 1 day | Day 12 | Day 13 | ✓ |
| 12: Documentation | 1 day | Day 13 | Day 13 | - |

### Critical Files List

1. **Database Schema**: `supabase/migrations/20260128000001_initial_schema.sql`
2. **RLS Policies**: `supabase/migrations/20260128000003_rls_policies.sql`
3. **Server Client**: `src/lib/supabase/server.ts`
4. **Middleware**: `src/middleware.ts`
5. **Get Feedback**: `src/features/feedback/actions/get-feedback.ts`

### Dependency Graph

```
Phase 0 (Init)
  ↓
Phase 1 (Database)
  ↓
Phase 2 (Infrastructure)
  ↓
Phase 3 (Auth)
  ↓
Phase 4 (Feedback) → Phase 5 (Comments)
  ↓                      ↓
Phase 6 (Roadmap)     Phase 7 (Changelog)
  ↓                      ↓
Phase 8 (Admin) ← ← ← ← ←
  ↓
Phase 9 (UX)
  ↓
Phase 10 (Testing)
  ↓
Phase 11 (Deploy)
  ↓
Phase 12 (Docs)
```

---

## Appendix

### PRD Key References

- **Database Schema**: PRD.md Section 6.1
- **API Specifications**: PRD.md Section 6.2
- **RLS Policies**: PRD.md Section 6.3
- **Validation Schemas**: PRD.md Section 6.5
- **Feature Requirements**: PRD.md Sections 3.1-3.8

### CLAUDE.md Standards Summary

- Use `type` instead of `interface`
- Props types must end with `Props` suffix
- Use arrow functions with `const`
- Components: PascalCase
- Utilities: camelCase
- Folders: kebab-case
- Server Components by default
- Use Zod for validation
- Never skip RLS policies
- Use toast for errors

### Tech Stack Details

**Core Framework**
- Next.js 15.1.6 (App Router)
- React 19
- TypeScript 5.7.3

**Styling**
- Tailwind CSS 3.4.18
- Shadcn/ui (Radix UI primitives)
- class-variance-authority
- clsx + tailwind-merge

**Backend**
- Supabase Client: @supabase/supabase-js 2.47.12
- Supabase SSR: @supabase/ssr 0.5.4
- PostgreSQL (via Supabase)

**Validation & Forms**
- Zod 3.24.1
- React Hook Form 7.54.2

**Additional Libraries**
- date-fns (date formatting)
- react-markdown + remark-gfm (changelog)
- @dnd-kit (drag-and-drop)
- sonner (toast notifications)
- lucide-react (icons)

**Testing**
- Vitest 2.1.8
- @testing-library/react 16.1.0
- @testing-library/jest-dom 6.6.3

---

## Notes

- **This is an aggressive timeline**. For part-time development, expect ~26 days (1 month).
- **No placeholders**: Every code snippet is production-ready.
- **No TODOs in critical code**: Workspace ID hardcoding is acceptable for v1, can be made dynamic later.
- **Testing is integrated**: Each phase includes verification steps.
- **RLS is never bypassed**: Security is built-in from Day 1.
- **Feature-based architecture**: Easy to add new features later.

## Success Criteria

✅ All 12 phases completed
✅ All verification steps passed
✅ Production deployment successful
✅ All features from PRD implemented
✅ Tests passing
✅ Documentation complete
✅ Zero critical bugs

---

**Last Updated**: 2026-01-28
**Version**: 1.0
**Status**: Ready for Implementation

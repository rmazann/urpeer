# Product Requirements Document (PRD)
## Urpeer.com - Centralized Feedback Platform for SaaS Products

**Version:** 1.0
**Last Updated:** 2026-01-28
**Status:** Draft

---

## 1. Executive Summary

Urpeer.com is a centralized feedback management platform designed for SaaS products. It enables product teams to collect user feedback, manage feature requests through voting, visualize product roadmaps, and publish changelogs. The platform bridges the gap between product owners and end users, fostering transparent communication and data-driven product development.

---

## 2. User Roles & Permissions

### 2.1 Admin (Product Owner)
**Primary Responsibilities:**
- Manage feedback items (create, edit, delete, change status)
- Organize roadmap timeline and priorities
- Publish changelog entries
- Engage with users through comments
- Configure workspace settings
- View analytics and voting trends

**Key Permissions:**
- Full CRUD operations on feedback items
- Roadmap management (drag-and-drop reordering, status updates)
- Changelog publishing
- User management within workspace
- Access to admin dashboard

### 2.2 Voter (End User)
**Primary Responsibilities:**
- Submit new feature requests
- Vote on existing feedback items
- View public roadmap
- Track changelog updates
- Comment on feedback items

**Key Permissions:**
- Create feedback items (if enabled by admin)
- Vote/unvote on feedback items (1 vote per user per item)
- View public roadmap and changelog
- Edit/delete own feedback submissions
- No access to admin dashboard

### 2.3 Permission Matrix

| Action | Admin | Voter |
|--------|-------|-------|
| Create Feedback | ✅ | ✅* |
| Edit Own Feedback | ✅ | ✅ |
| Edit Any Feedback | ✅ | ❌ |
| Delete Feedback | ✅ | ❌ |
| Change Feedback Status | ✅ | ❌ |
| Vote on Feedback | ✅ | ✅ |
| Comment on Feedback | ✅ | ✅ |
| Edit Own Comments | ✅ | ✅ |
| Delete Any Comment | ✅ | ❌ |
| View Roadmap | ✅ | ✅ |
| Edit Roadmap | ✅ | ❌ |
| Publish Changelog | ✅ | ❌ |
| View Changelog | ✅ | ✅ |
| Access Analytics | ✅ | ❌ |

*Voter creation can be restricted by admin settings.

---

## 3. Core Features

### 3.1 Feedback Management System

**Feature Description:**
A centralized board where users can submit, vote on, and track feature requests.

**Functional Requirements:**
- **FB-001:** Users must be able to submit feedback with title, description, and category
- **FB-002:** Each feedback item must display vote count, comment count, status, and creation date
- **FB-003:** Users can vote once per feedback item
- **FB-004:** Admins can change feedback status (Under Review, Planned, In Progress, Completed, Declined)
- **FB-005:** Feedback items must be filterable by status and category
- **FB-006:** Feedback items must be sortable by vote count, date, and trending score
- **FB-007:** All authenticated users (Admin & Voter) can comment on feedback items
- **FB-008:** Users can edit and delete their own comments
- **FB-009:** Admins can delete any comment (moderation capability)
- **FB-010:** Comments must display in chronological order (oldest first)

**Technical Requirements:**
- Real-time vote count updates using Supabase Realtime
- Optimistic UI updates for voting actions
- Pagination support (20 items per page)
- Server-side filtering and sorting

### 3.2 Roadmap Module

**Feature Description:**
A visual timeline showing planned features and their development status.

**Functional Requirements:**
- **RM-001:** Display features in chronological order based on planned release timeline
- **RM-002:** Features must be organized by status columns (Planned, In Progress, Completed)
- **RM-003:** Admins can drag-and-drop to reorder items within status groups
- **RM-004:** Each roadmap item must link back to its feedback entry
- **RM-005:** Public roadmap view must be accessible without authentication

**Roadmap Sorting Algorithm:**

```
Priority Score = (Vote Count × 0.7) + (Admin Priority × 0.3)

Where:
- Vote Count: Total number of user votes
- Admin Priority: Manual priority score (1-100) set by admin
- Default Admin Priority: 50 (if not set)

Additional Sorting Rules:
1. Status-based grouping (Planned > In Progress > Completed)
2. Within each status, sort by Priority Score (descending)
3. Ties are broken by creation date (older first)
```

**Technical Requirements:**
- Server-side calculation of priority scores
- Drag-and-drop using `@dnd-kit/core` library
- Optimistic reordering with server validation
- Caching strategy for public roadmap view

### 3.3 Changelog Module

**Feature Description:**
A chronological feed of product updates, bug fixes, and new features.

**Functional Requirements:**
- **CL-001:** Admins can create changelog entries with title, description, release date, and version number
- **CL-002:** Each entry can be categorized (New Feature, Improvement, Bug Fix, Breaking Change)
- **CL-003:** Changelog entries must support markdown formatting
- **CL-004:** Users can subscribe to changelog notifications (email/RSS)
- **CL-005:** Changelog entries must display in reverse chronological order
- **CL-006:** Each changelog can link to related feedback items

**Technical Requirements:**
- Markdown rendering using `react-markdown`
- RSS feed generation for changelog
- Email notifications via Supabase Edge Functions + Resend API
- Public RSS endpoint: `/api/changelog/rss`

---

## 4. Database Schema

### 4.1 Core Tables

```sql
-- Users (managed by Supabase Auth)
-- Extended profile table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('admin', 'voter')),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspaces (for multi-tenancy support)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  custom_domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback Items
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'under_review'
    CHECK (status IN ('under_review', 'planned', 'in_progress', 'completed', 'declined')),
  category TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  admin_priority INTEGER DEFAULT 50 CHECK (admin_priority BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- Roadmap Items
CREATE TABLE roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed')),
  planned_release_date DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Changelog Entries
CREATE TABLE changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL,
  release_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature'
    CHECK (category IN ('feature', 'improvement', 'bugfix', 'breaking')),
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Changelog-Feedback Links
CREATE TABLE changelog_feedback_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changelog_id UUID NOT NULL REFERENCES changelog_entries(id) ON DELETE CASCADE,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(changelog_id, feedback_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_feedback_workspace ON feedback(workspace_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_vote_count ON feedback(vote_count DESC);
CREATE INDEX idx_votes_feedback ON votes(feedback_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_roadmap_workspace ON roadmap_items(workspace_id);
CREATE INDEX idx_roadmap_status ON roadmap_items(status);
CREATE INDEX idx_roadmap_order ON roadmap_items(display_order);
CREATE INDEX idx_changelog_workspace ON changelog_entries(workspace_id);
CREATE INDEX idx_changelog_date ON changelog_entries(release_date DESC);
CREATE INDEX idx_comments_feedback ON comments(feedback_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created ON comments(created_at);
```

### 4.3 Row Level Security (RLS) Policies

```sql
-- Profiles: Users can view all profiles in their workspace, edit own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in workspace"
  ON profiles FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Feedback: Public read, authenticated write (if voter creation enabled)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update any feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND workspace_id = feedback.workspace_id
    )
  );

CREATE POLICY "Authors can update own feedback"
  ON feedback FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can delete feedback"
  ON feedback FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND workspace_id = feedback.workspace_id
    )
  );

-- Votes: Users can manage own votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (user_id = auth.uid());

-- Roadmap: Public read, admin write
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roadmap"
  ON roadmap_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage roadmap"
  ON roadmap_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND workspace_id = roadmap_items.workspace_id
    )
  );

-- Changelog: Public read, admin write
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published changelog"
  ON changelog_entries FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all changelog"
  ON changelog_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND workspace_id = changelog_entries.workspace_id
    )
  );

CREATE POLICY "Admins can manage changelog"
  ON changelog_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND workspace_id = changelog_entries.workspace_id
    )
  );

-- Comments: Public read, authenticated write
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN feedback f ON f.id = comments.feedback_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.workspace_id = f.workspace_id
    )
  );
```

### 4.4 Database Triggers

```sql
-- Auto-update vote_count on feedback when vote is added/removed
CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback
    SET vote_count = vote_count + 1
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback
    SET vote_count = vote_count - 1
    WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_count_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_feedback_vote_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_feedback
BEFORE UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_roadmap
BEFORE UPDATE ON roadmap_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_changelog
BEFORE UPDATE ON changelog_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_comments
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Auto-update comment_count on feedback when comment is added/removed
CREATE OR REPLACE FUNCTION update_feedback_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedback
    SET comment_count = comment_count + 1
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedback
    SET comment_count = comment_count - 1
    WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_feedback_comment_count();
```

---

## 5. API Endpoints

### 5.1 Authentication (via Supabase Auth)

```
POST   /auth/signup          - Register new user
POST   /auth/login           - Login user
POST   /auth/logout          - Logout user
GET    /auth/user            - Get current user profile
```

### 5.2 Feedback API

```
GET    /api/feedback                    - List all feedback (with filters)
  Query Params:
    - workspace_id (required)
    - status (optional): under_review|planned|in_progress|completed|declined
    - category (optional)
    - sort (optional): votes|date|trending (default: votes)
    - page (optional): default 1
    - limit (optional): default 20

GET    /api/feedback/:id                - Get single feedback item

POST   /api/feedback                    - Create new feedback
  Body: { title, description, category, workspace_id }
  Auth: Required

PATCH  /api/feedback/:id                - Update feedback
  Body: { title?, description?, status?, category?, admin_priority? }
  Auth: Admin or Author

DELETE /api/feedback/:id                - Delete feedback
  Auth: Admin only

POST   /api/feedback/:id/vote           - Vote on feedback
  Auth: Required

DELETE /api/feedback/:id/vote           - Remove vote
  Auth: Required
```

### 5.3 Roadmap API

```
GET    /api/roadmap                     - Get roadmap items
  Query Params:
    - workspace_id (required)
    - status (optional): planned|in_progress|completed

GET    /api/roadmap/:id                 - Get single roadmap item

POST   /api/roadmap                     - Create roadmap item
  Body: { title, description, status, planned_release_date, feedback_id?, workspace_id }
  Auth: Admin only

PATCH  /api/roadmap/:id                 - Update roadmap item
  Body: { title?, description?, status?, planned_release_date?, display_order? }
  Auth: Admin only

POST   /api/roadmap/reorder             - Batch reorder roadmap items
  Body: { items: [{ id, display_order }] }
  Auth: Admin only

DELETE /api/roadmap/:id                 - Delete roadmap item
  Auth: Admin only
```

### 5.4 Changelog API

```
GET    /api/changelog                   - Get published changelog entries
  Query Params:
    - workspace_id (required)
    - page (optional): default 1
    - limit (optional): default 10

GET    /api/changelog/rss               - RSS feed for changelog
  Query Params:
    - workspace_id (required)

GET    /api/changelog/:id               - Get single changelog entry

POST   /api/changelog                   - Create changelog entry
  Body: { title, description, version, release_date, category, workspace_id }
  Auth: Admin only

PATCH  /api/changelog/:id               - Update changelog entry
  Body: { title?, description?, version?, release_date?, category?, published? }
  Auth: Admin only

DELETE /api/changelog/:id               - Delete changelog entry
  Auth: Admin only

POST   /api/changelog/:id/link-feedback - Link feedback to changelog
  Body: { feedback_id }
  Auth: Admin only
```

### 5.5 Comments API

```
GET    /api/comments                    - Get comments for a feedback item
  Query Params:
    - feedback_id (required)
    - page (optional): default 1
    - limit (optional): default 50

GET    /api/comments/:id                - Get single comment

POST   /api/comments                    - Create new comment
  Body: { feedback_id, content }
  Auth: Required

PATCH  /api/comments/:id                - Update comment
  Body: { content }
  Auth: Author only

DELETE /api/comments/:id                - Delete comment
  Auth: Author or Admin
```

### 5.6 Analytics API (Admin Only)

```
GET    /api/analytics/feedback-stats    - Get feedback statistics
  Response: { total, by_status, top_voted }
  Auth: Admin only

GET    /api/analytics/voting-trends     - Get voting trends over time
  Auth: Admin only
```

---

## 6. Technical Requirements

### 6.1 Performance Targets
- Page load time: < 2 seconds
- Time to Interactive (TTI): < 3 seconds
- API response time: < 500ms (p95)
- Database query time: < 200ms (p95)
- Support for 10,000+ concurrent voters

### 6.2 Security Requirements
- **SEC-001:** All API endpoints must validate input using Zod schemas
- **SEC-002:** Supabase RLS policies must enforce all authorization rules
- **SEC-003:** No sensitive data in client-side logs
- **SEC-004:** CSRF protection for all state-changing operations
- **SEC-005:** Rate limiting: 100 requests/minute per IP for public endpoints
- **SEC-006:** Rate limiting: 10 votes/minute per user
- **SEC-007:** Rate limiting: 20 comments/hour per user (spam prevention)

### 6.3 Data Validation Schemas (Zod)

```typescript
// Feedback Schema
export const createFeedbackSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(2000),
  category: z.string().max(50).optional(),
  workspace_id: z.string().uuid(),
});

export const updateFeedbackSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  status: z.enum(['under_review', 'planned', 'in_progress', 'completed', 'declined']).optional(),
  category: z.string().max(50).optional(),
  admin_priority: z.number().min(1).max(100).optional(),
});

// Roadmap Schema
export const createRoadmapSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['planned', 'in_progress', 'completed']),
  planned_release_date: z.string().datetime().optional(),
  feedback_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid(),
});

// Changelog Schema
export const createChangelogSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // Semantic versioning
  release_date: z.string().datetime(),
  category: z.enum(['feature', 'improvement', 'bugfix', 'breaking']),
  workspace_id: z.string().uuid(),
});

// Comment Schema
export const createCommentSchema = z.object({
  feedback_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});
```

---

## 7. UI/UX Requirements

### 7.1 Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly targets (min 44x44px)

### 7.2 Accessibility (WCAG 2.1 Level AA)
- Keyboard navigation support
- ARIA labels for screen readers
- Color contrast ratio ≥ 4.5:1
- Focus indicators on all interactive elements

### 7.3 Loading States
- Skeleton loaders for initial page load
- Optimistic UI updates for voting
- Toast notifications for success/error states

---

## 8. Future Enhancements (Out of Scope for v1.0)

- **Multi-language support:** i18n implementation
- **Threaded comments:** Nested reply system for deeper discussions
- **Comment reactions:** Emoji reactions (👍, ❤️, 🎉) on comments
- **Email notifications:** Real-time alerts for feedback updates and comment replies
- **SSO integration:** Google, GitHub, Microsoft authentication
- **Custom branding:** White-label solution for enterprises
- **Advanced analytics:** Cohort analysis, retention metrics
- **AI-powered insights:** Auto-categorization, sentiment analysis
- **Integrations:** Slack, Discord, Jira, Linear webhooks

---

## 9. Success Metrics

### 9.1 User Engagement
- Daily Active Users (DAU)
- Average votes per user
- Feedback submission rate
- Comment engagement rate (comments per feedback item)
- Return visitor rate

### 9.2 Product Metrics
- Average time to feedback resolution
- Percentage of feedback items moved to roadmap
- Changelog publish frequency
- Admin response time to new feedback

### 9.3 Technical Metrics
- API uptime (target: 99.9%)
- Error rate (target: < 0.1%)
- Database query performance
- Page load metrics (Core Web Vitals)

---

## 10. Deployment & Infrastructure

### 10.1 Hosting
- **Frontend:** Vercel (Next.js optimized)
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Edge Functions:** Supabase Edge Functions (Deno runtime)

### 10.2 CI/CD Pipeline
- **Testing:** Vitest for unit tests, Playwright for E2E
- **Linting:** ESLint + TypeScript strict mode
- **Pre-commit hooks:** Husky + lint-staged
- **Deployment:** Auto-deploy on `main` branch push

### 10.3 Monitoring
- **Error tracking:** Sentry
- **Analytics:** Vercel Analytics + Supabase Analytics
- **Uptime monitoring:** UptimeRobot or Betterstack

---

## 11. Glossary

- **Feedback Item:** A user-submitted feature request or bug report
- **Vote:** A user's endorsement of a feedback item (1 vote per user)
- **Roadmap:** Public timeline of planned and in-progress features
- **Changelog:** Historical record of product updates and releases
- **Workspace:** Isolated environment for a single SaaS product (multi-tenancy unit)
- **Admin Priority:** Manual override score (1-100) set by product owners
- **Priority Score:** Calculated ranking based on votes and admin priority

---

**Document Status:** Ready for Technical Review
**Next Steps:** Database migration scripts, API implementation, UI mockups

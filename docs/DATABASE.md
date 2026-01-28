# Database Schema Documentation

Urpeer uses Supabase (PostgreSQL) as its database. This document describes the schema, relationships, and security policies.

## Entity Relationship Diagram

```
┌─────────────────┐
│   workspaces    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │    feedback     │
├─────────────────┤       ├─────────────────┤
│ id (PK, FK)     │──1:N─▶│ id (PK)         │
│ workspace_id    │       │ author_id (FK)  │
│ full_name       │       │ workspace_id    │
│ role            │       │ title           │
│ created_at      │       │ description     │
│ updated_at      │       │ category        │
└─────────────────┘       │ status          │
         │                │ vote_count      │
         │                │ comment_count   │
         │                │ created_at      │
         │                │ updated_at      │
         │                └────────┬────────┘
         │                         │
         │                         │ 1:N
         │                         ▼
         │                ┌─────────────────┐
         │                │     votes       │
         │                ├─────────────────┤
         └───────1:N─────▶│ id (PK)         │
                          │ user_id (FK)    │
                          │ feedback_id(FK) │
                          │ created_at      │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  roadmap_items  │       │changelog_entries│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ workspace_id    │       │ workspace_id    │
│ feedback_id(FK) │       │ author_id (FK)  │
│ title           │       │ title           │
│ description     │       │ content         │
│ status          │       │ category        │
│ eta             │       │ published       │
│ display_order   │       │ published_at    │
│ created_at      │       │ created_at      │
│ updated_at      │       │ updated_at      │
└─────────────────┘       └────────┬────────┘
                                   │
                                   │ M:N
                                   ▼
                          ┌─────────────────────────┐
                          │changelog_feedback_links │
                          ├─────────────────────────┤
                          │ changelog_id (FK)       │
                          │ feedback_id (FK)        │
                          │ created_at              │
                          └─────────────────────────┘

┌─────────────────┐
│    comments     │
├─────────────────┤
│ id (PK)         │
│ feedback_id(FK) │
│ author_id (FK)  │
│ content         │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Tables

### workspaces

Multi-tenant workspace support (currently single workspace).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | text | NOT NULL | Workspace display name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

### profiles

User profiles extending Supabase Auth users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users(id) | User ID from Supabase Auth |
| workspace_id | uuid | FK → workspaces(id) | Associated workspace |
| full_name | text | | User's display name |
| role | text | DEFAULT 'user' | Role: 'admin' or 'user' |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### feedback

User feedback submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| workspace_id | uuid | FK → workspaces(id), NOT NULL | Associated workspace |
| author_id | uuid | FK → profiles(id), NOT NULL | Submitter's user ID |
| title | text | NOT NULL | Feedback title |
| description | text | NOT NULL | Detailed description |
| category | text | NOT NULL | Category: feature, improvement, bug, other |
| status | text | DEFAULT 'open' | Status: open, under_review, planned, in_progress, completed, closed |
| vote_count | integer | DEFAULT 0 | Cached vote count |
| comment_count | integer | DEFAULT 0 | Cached comment count |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### votes

User votes on feedback items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Voter's user ID |
| feedback_id | uuid | FK → feedback(id) ON DELETE CASCADE | Voted feedback |
| created_at | timestamptz | DEFAULT now() | Vote timestamp |

**Unique Constraint:** (user_id, feedback_id) - One vote per user per feedback

### roadmap_items

Product roadmap entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| workspace_id | uuid | FK → workspaces(id), NOT NULL | Associated workspace |
| feedback_id | uuid | FK → feedback(id) | Linked feedback (optional) |
| title | text | NOT NULL | Item title |
| description | text | | Item description |
| status | text | DEFAULT 'planned' | Status: planned, in-progress, completed |
| eta | text | | Estimated time (e.g., "Q1 2026") |
| display_order | integer | DEFAULT 0 | Sort order within status |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### changelog_entries

Product changelog/release notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| workspace_id | uuid | FK → workspaces(id), NOT NULL | Associated workspace |
| author_id | uuid | FK → profiles(id), NOT NULL | Author's user ID |
| title | text | NOT NULL | Entry title |
| content | text | NOT NULL | Markdown content |
| category | text | NOT NULL | Category: feature, improvement, bugfix, breaking |
| published | boolean | DEFAULT false | Publication status |
| published_at | timestamptz | | Publication timestamp |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### changelog_feedback_links

Many-to-many relationship between changelog and feedback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| changelog_id | uuid | FK → changelog_entries(id) ON DELETE CASCADE | Changelog entry |
| feedback_id | uuid | FK → feedback(id) ON DELETE CASCADE | Linked feedback |
| created_at | timestamptz | DEFAULT now() | Link timestamp |

**Primary Key:** (changelog_id, feedback_id)

### comments

Discussion comments on feedback items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| feedback_id | uuid | FK → feedback(id) ON DELETE CASCADE | Parent feedback |
| author_id | uuid | FK → profiles(id), NOT NULL | Comment author |
| content | text | NOT NULL | Comment content |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

## Indexes

Performance indexes created for common queries:

```sql
-- Feedback queries
CREATE INDEX idx_feedback_workspace ON feedback(workspace_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_vote_count ON feedback(vote_count DESC);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- Votes queries
CREATE INDEX idx_votes_feedback ON votes(feedback_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_user_feedback ON votes(user_id, feedback_id);

-- Roadmap queries
CREATE INDEX idx_roadmap_workspace ON roadmap_items(workspace_id);
CREATE INDEX idx_roadmap_status ON roadmap_items(status);
CREATE INDEX idx_roadmap_order ON roadmap_items(display_order);

-- Changelog queries
CREATE INDEX idx_changelog_workspace ON changelog_entries(workspace_id);
CREATE INDEX idx_changelog_published ON changelog_entries(published);
CREATE INDEX idx_changelog_published_at ON changelog_entries(published_at DESC);

-- Comments queries
CREATE INDEX idx_comments_feedback ON comments(feedback_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
```

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

### workspaces

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true (all can read) |
| Admin manage | ALL | user role = 'admin' |

### profiles

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true |
| Own profile | UPDATE | auth.uid() = id |

### feedback

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true |
| Authenticated create | INSERT | auth.uid() IS NOT NULL |
| Author update | UPDATE | auth.uid() = author_id |
| Admin update | UPDATE | user role = 'admin' |
| Author delete | DELETE | auth.uid() = author_id |
| Admin delete | DELETE | user role = 'admin' |

### votes

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true |
| Own votes | INSERT | auth.uid() = user_id |
| Own votes | DELETE | auth.uid() = user_id |

### roadmap_items

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true |
| Admin manage | INSERT, UPDATE, DELETE | user role = 'admin' |

### changelog_entries

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read published | SELECT | published = true |
| Admin read all | SELECT | user role = 'admin' |
| Admin manage | INSERT, UPDATE, DELETE | user role = 'admin' |

### comments

| Policy | Operation | Rule |
|--------|-----------|------|
| Public read | SELECT | true |
| Authenticated create | INSERT | auth.uid() IS NOT NULL |
| Author update | UPDATE | auth.uid() = author_id |
| Author delete | DELETE | auth.uid() = author_id |
| Admin delete | DELETE | user role = 'admin' |

## Triggers

### update_vote_count

Updates feedback.vote_count when votes are inserted or deleted.

```sql
CREATE OR REPLACE FUNCTION update_vote_count()
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
```

### update_comment_count

Updates feedback.comment_count when comments are inserted or deleted.

```sql
CREATE OR REPLACE FUNCTION update_comment_count()
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
```

### update_updated_at

Automatically updates the updated_at column on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: profiles, feedback, roadmap_items, changelog_entries, comments
```

## Migration Files

Located in `supabase/migrations/`:

1. `20260128000001_initial_schema.sql` - Tables and relationships
2. `20260128000002_indexes.sql` - Performance indexes
3. `20260128000003_rls_policies.sql` - Row Level Security
4. `20260128000004_triggers.sql` - Automated updates

## Running Migrations

```bash
# Link to Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
npx supabase db push

# Create new migration
npx supabase migration new migration_name

# Reset database (development only)
npx supabase db reset
```

## Seed Data

For development, seed data can be added via `supabase/seed.sql`:

```sql
-- Create default workspace
INSERT INTO workspaces (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Urpeer', 'urpeer');

-- Additional seed data as needed
```

## Backup & Restore

Supabase provides automatic backups. For manual backup:

```bash
# Export schema
pg_dump -h YOUR_HOST -U postgres -d postgres --schema-only > schema.sql

# Export data
pg_dump -h YOUR_HOST -U postgres -d postgres --data-only > data.sql
```

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-28

### Added

#### Core Features
- **Feedback Board** - Submit, view, and filter feedback items
- **Voting System** - Upvote feedback with real-time count updates
- **Comments** - Threaded discussions on feedback items with inline editing
- **Roadmap** - Public roadmap with three-column kanban view (Planned, In Progress, Completed)
- **Changelog** - Product updates with markdown support

#### Admin Features
- **Admin Dashboard** - Overview with stats, charts, and recent activity
- **Feedback Management** - Table view with inline status updates
- **Changelog Editor** - Create, edit, and publish changelog entries
- **Roadmap Management** - Drag-and-drop reordering with status changes

#### Authentication
- Email/password authentication via Supabase
- User profiles with display names
- Role-based access control (admin/user)

#### Technical
- Next.js 16 with App Router and React Compiler
- TypeScript with strict mode
- Supabase PostgreSQL database with Row Level Security
- Server Actions for all data mutations
- Zod v4 validation schemas
- Vitest unit tests (60 tests passing)
- Vercel Analytics and Speed Insights integration
- Dynamic sitemap and RSS feed
- Health check endpoint

#### UI/UX
- Responsive design with mobile navigation
- Loading skeletons and states
- Error boundaries with recovery
- Toast notifications
- Empty state components
- 404 pages for missing content

### Security
- Row Level Security (RLS) policies on all tables
- CSRF protection via Server Actions
- Security headers via Vercel configuration
- Input validation on all forms

---

## [Unreleased]

### Planned
- OAuth providers (Google, GitHub)
- Email notifications
- Webhook integrations
- API rate limiting
- Multi-workspace support
- Export functionality

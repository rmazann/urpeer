# CLAUDE.md - Urpeer.com Development Protocols

## Project Context
**Urpeer.com** is a centralized feedback platform built for SaaS products, providing feature voting, roadmap, changelog management, and user discussions.
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (Auth & DB), Shadcn/ui.
- **Primary Roles:** Admin (Product Owners), Voter (End Users).
- **Core Features:** Feedback submission & voting, Comments & discussions, Roadmap visualization, Changelog publishing.

## Commands
- **Development Server:** `npm run dev`
- **Database Studio:** `npx supabase studio`
- **Type Checking:** `npm run type-check`
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Vitest)
- **Build:** `npm run build`

## Architectural Standards
- **Directory Structure:** `src/app` (routes), `src/features` (business logic), `src/components/ui` (atomic components).
- **Feature-Based Architecture:** Each main module (e.g., `feedback`, `roadmap`, `auth`) must have its own folder under `src/features/`, containing `components`, `hooks`, and `types`.
- **Server Components:** Use Server Components by default. Only add `'use client'` at the top of the file when `useState`, `useEffect`, or client-side interaction is required.
- **Data Fetching:** Always fetch data on the server side using the Supabase Server Client (inside Server Actions or Server Components).

## Coding Rules (TypeScript & React)
- **Types:** Use `type` instead of `interface`. Props definitions must always end with the `Props` suffix (e.g., `FeedbackCardProps`).
- **Functions:** Prefer arrow functions defined with `const`.
- **Naming Conventions:**
  - Components: `PascalCase` (e.g., `FeatureList.tsx`)
  - Utility Functions: `camelCase` (e.g., `calculateVotes.ts`)
  - Folders: `kebab-case` (e.g., `feedback-board`)
- **Styling:** Use Tailwind CSS classes. For complex conditional styles, use the `cn()` helper (clsx + tailwind-merge).

## Error Handling and Security
- **Validation:** Use `Zod` schemas for all form inputs and API requests.
- **Supabase RLS:** Row Level Security (RLS) policies must *never* be skipped when creating database tables. Always start with "deny all" by default.
- **Error Display:** User-facing errors must be shown using the `toast` (sonner) component; do not leave silent `console.log` statements.

## Artificial Intelligence Behavior Rules (Meta-Rules)
- **Planning:** Before implementing a complex feature (e.g., "Roadmap drag-and-drop ordering"), first design the algorithm and data update strategy in `/plan` mode or within a "Thinking" block.
- **Change Management:** When refactoring existing code, prioritize preserving working functionality. If unsure, suggest writing tests.
- **File Access:** Never attempt to read the `node_modules`, `.next`, or `.git` directories.

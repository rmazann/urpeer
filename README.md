# Urpeer.com

A centralized feedback platform for SaaS products. Collect user feedback, manage roadmaps, and share changelogs with your users.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Feedback Board** - Users can submit and vote on feature requests, bug reports, and improvements
- **Roadmap** - Public roadmap with drag-and-drop management for admins
- **Changelog** - Publish product updates with markdown support and RSS feed
- **Comments** - Threaded discussions on feedback items
- **Admin Dashboard** - Analytics, feedback management, and content publishing

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router & React Compiler
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Validation:** [Zod v4](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or pnpm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/urpeer.com.git
cd urpeer.com
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

Create a new project at [supabase.com](https://supabase.com) and run the migrations:

```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push database schema
npx supabase db push
```

4. **Configure environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Creating an Admin User

1. Sign up through the UI
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find your user and set `role` to `admin`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard routes
│   ├── api/                # API routes (health, RSS)
│   ├── changelog/          # Changelog pages
│   ├── feedback/           # Feedback pages
│   └── roadmap/            # Roadmap page
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-based modules
│   ├── admin/              # Admin components & actions
│   ├── auth/               # Authentication
│   ├── changelog/          # Changelog feature
│   ├── comments/           # Comments feature
│   ├── feedback/           # Feedback feature
│   └── roadmap/            # Roadmap feature
└── lib/                    # Utilities & configurations
    ├── supabase/           # Supabase clients
    └── validations/        # Zod schemas
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |

## Database Schema

The application uses 8 main tables:

- `workspaces` - Multi-tenant workspace support
- `profiles` - User profiles with roles
- `feedback` - User feedback submissions
- `votes` - Feedback voting records
- `roadmap_items` - Roadmap entries
- `changelog_entries` - Changelog posts
- `changelog_feedback_links` - Links between changelog and feedback
- `comments` - Discussion comments

See [docs/DATABASE.md](docs/DATABASE.md) for detailed schema documentation.

## API Reference

All data operations use Server Actions. See [docs/API.md](docs/API.md) for detailed documentation.

### Key Server Actions

**Feedback**
- `createFeedback(formData)` - Submit new feedback
- `getFeedback(options)` - Get filtered feedback list
- `voteFeedback(feedbackId)` - Toggle vote on feedback

**Roadmap**
- `getRoadmapByStatus()` - Get roadmap items grouped by status
- `createRoadmapItem(formData)` - Add roadmap item (admin)
- `updateRoadmapItemStatus(id, status)` - Move item between columns

**Changelog**
- `getChangelog(page, limit)` - Get paginated changelog
- `createChangelogEntry(formData)` - Create changelog draft (admin)
- `publishChangelog(id)` - Publish changelog entry (admin)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site URL |
| `SENTRY_DSN` | No | Sentry error tracking |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

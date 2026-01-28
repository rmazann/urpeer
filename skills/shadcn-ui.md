# Shadcn/ui Component Patterns Skill

**Installed:** 2026-01-28
**Source:** https://github.com/giuseppe-trisciuoglio/developer-kit
**Author:** Giuseppe Trisciuoglio
**License:** MIT
**Languages:** TypeScript, TSX
**Frameworks:** React, Next.js, Tailwind CSS
**Allowed Tools:** Read, Write, Bash, Edit, Glob

## Description

Complete shadcn/ui component library guide including installation, configuration, and implementation of accessible React components. Expert guide for building customizable UI components with shadcn/ui, Radix UI, and Tailwind CSS.

## What is shadcn/ui?

shadcn/ui is **not** a traditional component library or npm package. Instead:
- It's a **collection of reusable components** that you copy into your project
- Components are **yours to customize** - you own the code
- Built with **Radix UI** primitives for accessibility
- Styled with **Tailwind CSS** utilities
- Includes CLI tool for easy component installation

## When to Use

This skill triggers when:
- Setting up a new project with shadcn/ui
- Installing or configuring individual components
- Building forms with React Hook Form and Zod validation
- Creating accessible UI components (buttons, dialogs, dropdowns, sheets)
- Customizing component styling with Tailwind CSS
- Implementing design systems with shadcn/ui
- Building Next.js applications with TypeScript
- Creating complex layouts and data displays

## Quick Start

### For New Projects
```bash
# Create Next.js project with shadcn/ui
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
npx shadcn@latest init

# Install essential components
npx shadcn@latest add button input form card dialog select
```

### For Existing Projects
```bash
# Install dependencies
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Initialize shadcn/ui
npx shadcn@latest init
```

## Installation & Setup

### Initialize shadcn/ui
```bash
npx shadcn@latest init
```

During setup, configure:
- TypeScript or JavaScript
- Style (Default, New York, etc.)
- Base color theme
- CSS variables or Tailwind CSS classes
- Component installation path

### Installing Components

```bash
# Install a single component
npx shadcn@latest add button

# Install multiple components
npx shadcn@latest add button input form

# Install all components
npx shadcn@latest add --all
```

## Required Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

## Core Components Overview

### Button Component
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Loading states with spinners
- Installation: `npx shadcn@latest add button`

### Input & Form Fields
- Basic inputs with labels
- Form validation with React Hook Form and Zod
- Error message display
- Input groups with buttons
- Installation: `npx shadcn@latest add input form`

### Card Component
- Structured layouts with header, content, footer
- Ideal for feedback cards, roadmap items, changelogs
- Installation: `npx shadcn@latest add card`

### Dialog (Modal) Component
- Accessible modal dialogs
- Confirmation dialogs for destructive actions
- Form dialogs
- Installation: `npx shadcn@latest add dialog`

### Sheet (Slide-over) Component
- Side panels from left, right, top, bottom
- Mobile-friendly navigation
- Settings panels
- Installation: `npx shadcn@latest add sheet`

### Select (Dropdown) Component
- Accessible dropdown selects
- Form integration
- Multi-select options
- Installation: `npx shadcn@latest add select`

### Table Component
- Data tables with sorting, filtering
- Responsive table layouts
- Installation: `npx shadcn@latest add table`

### Toast Notifications
- Success, error, warning notifications
- Action buttons in toasts
- Auto-dismiss functionality
- Installation: `npx shadcn@latest add toast`

### Additional Components
- Menubar & Navigation
- Accordion
- Alert Dialog
- Tabs
- Separator
- Badge
- Avatar
- Checkbox
- Radio Group
- Switch
- Textarea
- Tooltip
- Popover
- Command
- Calendar
- Date Picker

## Customization

### Theming with CSS Variables

shadcn/ui uses CSS variables for theming. Configure in `globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ...additional dark mode variables */
  }
}
```

### Customizing Components

Since you own the code, customize components directly in `src/components/ui/`:

- Add custom variants to buttons
- Modify default styles
- Add new component sizes
- Extend component props
- Change color schemes

## Next.js Integration

### App Router Setup

Components use `"use client"` directive for Next.js 13+ App Router:

```tsx
// src/components/ui/button.tsx
"use client"

import * as React from "react"
// ... rest of component
```

### Layout Integration

Add Toaster to root layout:

```tsx
// app/layout.tsx
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Server Components

Wrap interactive components in Client Components when using in Server Components.

### Server Actions with Forms

Integrate with Next.js Server Actions for form submissions.

## Application to Urpeer.com

### Project Context

Urpeer.com already uses:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Supabase** for backend

### Core Urpeer.com Components

**1. Feedback Board Components**
- **FeedbackCard** (Card + Button for voting)
  - Display feedback title, description, vote count
  - Voting button with loading state
  - Status badge (Planned, In Progress, Completed)
  - Comment count indicator

- **FeedbackSubmitForm** (Form + Input + Textarea + Select + Button)
  - Title input field
  - Description textarea
  - Category select dropdown
  - Submit button with validation
  - Error message display

**2. Roadmap Components**
- **RoadmapCard** (Card with custom styling)
  - Milestone visualization
  - Status indicators
  - Timeline view
  - Drag-and-drop ordering (future enhancement)

- **RoadmapStatusFilter** (Select or Tabs)
  - Filter by status (Planned, In Progress, Completed)
  - URL state sync

**3. Changelog Components**
- **ChangelogCard** (Card with rich content)
  - Version number display
  - Release date
  - Change list (features, fixes, improvements)
  - Images/media support

- **ChangelogEditor** (Form with rich text)
  - Admin-only changelog creation
  - Markdown or rich text editor
  - Image upload
  - Publish/draft toggle

**4. Comment System**
- **CommentList** (Recursive component)
  - Nested comment threads
  - Reply functionality
  - User avatars
  - Timestamp display

- **CommentForm** (Form + Textarea + Button)
  - Reply to feedback/comments
  - Validation
  - Loading states

**5. Admin Components**
- **AdminDashboard** (Complex layout with multiple Cards)
  - Metrics display
  - Feedback management table
  - User management

- **FeedbackManagementTable** (Table + Dialog)
  - Sort and filter feedback
  - Status change dialog
  - Bulk actions

- **SettingsPanel** (Sheet or Card)
  - Project settings
  - Notification preferences
  - API key management

**6. Authentication Components**
- **LoginForm** (Card + Form + Input + Button)
  - Email/password fields
  - Validation
  - Error handling

- **SignupForm** (Card + Form + Input + Button)
  - User registration
  - Email verification

### Component Installation Priority

For Urpeer.com, install these components:

```bash
# Essential UI components
npx shadcn@latest add button input textarea label form card

# Dialogs and overlays
npx shadcn@latest add dialog sheet alert-dialog

# Dropdowns and selections
npx shadcn@latest add select dropdown-menu

# Notifications
npx shadcn@latest add toast

# Data display
npx shadcn@latest add table badge avatar separator

# Navigation
npx shadcn@latest add tabs menubar

# Optional but useful
npx shadcn@latest add accordion calendar date-picker checkbox radio-group switch
```

### Customization for Urpeer.com

**Custom CSS Variables:**
- Define brand colors in CSS variables
- Set custom `--radius` for consistent border radius
- Create custom variants for feedback status (planned, in-progress, completed)

**Custom Button Variants:**
```tsx
// Add voting button variant
custom: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
```

**Custom Card Styles:**
- Feedback card hover effects
- Status-based border colors
- Elevated cards for active items

### Form Validation Schemas for Urpeer.com

**Feedback Submission:**
```tsx
const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(["feature", "bug", "improvement"]),
})
```

**Comment Submission:**
```tsx
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
})
```

**Changelog Creation:**
```tsx
const changelogSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: z.string().min(5),
  content: z.string().min(20),
  publishedAt: z.date(),
})
```

## Best Practices

1. **Accessibility**: Components use Radix UI primitives for ARIA compliance
2. **Customization**: Modify components directly in your codebase
3. **Type Safety**: Use TypeScript for type-safe props and state
4. **Validation**: Use Zod schemas for form validation
5. **Styling**: Leverage Tailwind utilities and CSS variables
6. **Consistency**: Use the same component patterns across your app
7. **Testing**: Components are testable with React Testing Library
8. **Performance**: Components are optimized and tree-shakeable

## Integration with Other Skills

### Works with Vercel React Best Practices
- Use forms with proper validation
- Optimize re-renders with memoization
- Server-side rendering with Next.js

### Works with Web Design Guidelines
- All components are accessible by default
- Proper focus states
- Keyboard navigation support
- ARIA attributes included

### Works with Frontend Design
- Customize component styling to match brand aesthetic
- Create distinctive designs while maintaining accessibility
- Use CSS variables for theming

## Installation Location

Global installation at: `~/.agents/skills/shadcn-ui`

## Usage

The skill is automatically available and will guide:
- Component selection and installation
- Form implementation with validation
- Customization and theming
- Next.js integration patterns
- Accessibility best practices

## References

- Official Docs: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- Tailwind CSS: https://tailwindcss.com
- Examples: https://ui.shadcn.com/examples

## Common Patterns for Urpeer.com

### Feedback Card with Voting
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <div className="flex justify-between items-start">
      <CardTitle>{feedback.title}</CardTitle>
      <Badge>{feedback.status}</Badge>
    </div>
    <CardDescription>{feedback.description}</CardDescription>
  </CardHeader>
  <CardFooter className="flex justify-between">
    <Button variant="ghost" size="sm">
      💬 {feedback.commentCount}
    </Button>
    <Button variant="default" size="sm">
      👍 {feedback.voteCount}
    </Button>
  </CardFooter>
</Card>
```

### Feedback Submission Form
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Feature request title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea placeholder="Describe your idea..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit Feedback</Button>
  </form>
</Form>
```

### Confirmation Dialog for Admin Actions
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Feedback</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the feedback.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

This skill provides the foundation for building all UI components in Urpeer.com with consistent patterns, accessibility, and type safety.

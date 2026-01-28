# Web Design Guidelines Skill

**Installed:** 2026-01-28
**Source:** https://github.com/vercel-labs/agent-skills
**Version:** 1.0.0
**Author:** Vercel
**License:** MIT

## Description

Review UI code for Web Interface Guidelines compliance from Vercel. This skill audits accessibility, UX patterns, performance, and design best practices in web applications.

## When to Use

This skill triggers when you ask:
- "Review my UI"
- "Check accessibility"
- "Audit design"
- "Review UX"
- "Check my site against best practices"

## How It Works

1. Fetches the latest guidelines from source
2. Reads specified files or patterns
3. Checks against all rules
4. Outputs findings in `file:line` format

## Guidelines Source

Always fetches fresh guidelines from:
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

## Complete Rule Categories

### 1. Accessibility
- **Icon-only buttons**: Require `aria-label`
- **Form controls**: Need `<label>` or `aria-label`
- **Interactive elements**: Require keyboard handlers (`onKeyDown`/`onKeyUp`)
- **Semantic HTML**: Use `<button>` for actions, `<a>`/`<Link>` for navigation (avoid `<div onClick>`)
- **Images**: Require `alt` text (or `alt=""` if decorative)
- **Decorative icons**: Need `aria-hidden="true"`
- **Async updates**: Require `aria-live="polite"` for toasts/validation
- **HTML hierarchy**: Prefer semantic tags before ARIA attributes
- **Headings**: Maintain hierarchical structure `<h1>`–`<h6>`; include skip link
- **Anchor offsets**: Add `scroll-margin-top` to heading anchors

### 2. Focus States
- **Visible focus**: All interactive elements need `focus-visible:ring-*` or equivalent
- **Focus replacement**: Never use `outline-none` without fallback
- **Pseudo-selector choice**: Use `:focus-visible` over `:focus`
- **Compound controls**: Group focus with `:focus-within`

### 3. Forms
- **Input attributes**: Need `autocomplete`, meaningful `name`, correct `type` (`email`, `tel`, `url`, `number`), `inputmode`
- **Paste handling**: Never block paste with `preventDefault`
- **Clickable labels**: Use `htmlFor` or wrap control
- **Spellcheck**: Disable on emails, codes, usernames (`spellCheck={false}`)
- **Checkboxes/radios**: Label + control share single hit target
- **Submit button**: Stays enabled until request starts; show spinner during request
- **Error display**: Inline next to fields; focus first error on submit
- **Placeholders**: End with `…`, show example pattern
- **Password managers**: Use `autocomplete="off"` on non-auth fields
- **Unsaved changes**: Warn before navigation (`beforeunload` or router guard)

### 4. Animation
- **Motion preferences**: Honor `prefers-reduced-motion`
- **Compositor-friendly**: Animate `transform`/`opacity` only
- **Transition specificity**: Never `transition: all`—list properties explicitly
- **Transform origin**: Set correctly for the element
- **SVG transforms**: Apply to `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- **Interruptibility**: Animations must respond to user input mid-animation

### 5. Typography
- **Ellipsis**: Use `…` not `...`
- **Quotation marks**: Use curly quotes `"` `"` not straight `"`
- **Non-breaking spaces**: Apply to measurements (`10&nbsp;MB`), keyboard shortcuts, brand names
- **Loading states**: End with `…` ("Loading…", "Saving…")
- **Number columns**: Use `font-variant-numeric: tabular-nums`
- **Heading widows**: Apply `text-wrap: balance` or `text-pretty`

### 6. Content Handling
- **Text overflow**: Use `truncate`, `line-clamp-*`, or `break-words`
- **Flex truncation**: Children need `min-w-0` for text truncation
- **Empty states**: Don't render broken UI for empty strings/arrays
- **Variable input**: Anticipate short, average, and very long user-generated content

### 7. Images
- **Dimensions**: `<img>` needs explicit `width` and `height` (prevents CLS)
- **Lazy loading**: Below-fold images use `loading="lazy"`
- **Critical images**: Above-fold use `priority` or `fetchpriority="high"`

### 8. Performance
- **Large lists**: Virtualize when >50 items (`virtua`, `content-visibility: auto`)
- **Layout thrashing**: Avoid `getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop` in render
- **Batch operations**: Batch DOM reads/writes; don't interleave
- **Input control**: Prefer uncontrolled inputs; controlled must be cheap per keystroke
- **Preconnect**: Add `<link rel="preconnect">` for CDN/asset domains
- **Critical fonts**: Use `<link rel="preload" as="font">` with `font-display: swap`

### 9. Navigation & State
- **URL state**: Filters, tabs, pagination, expanded panels in query params
- **Link semantics**: Use `<a>`/`<Link>` for Cmd/Ctrl+click, middle-click support
- **Deep linking**: If UI uses `useState`, consider URL sync (via nuqs or similar)
- **Destructive actions**: Require confirmation modal or undo window—never immediate

### 10. Touch & Interaction
- **Tap delay**: `touch-action: manipulation` prevents double-tap zoom delay
- **Tap highlight**: Set `-webkit-tap-highlight-color` intentionally
- **Scrolling containment**: `overscroll-behavior: contain` in modals/drawers/sheets
- **Drag behavior**: Disable text selection, add `inert` on dragged elements
- **AutoFocus**: Use sparingly—desktop only, single primary input; avoid on mobile

### 11. Safe Areas & Layout
- **Notches**: Full-bleed layouts use `env(safe-area-inset-*)`
- **Scrollbars**: Avoid unwanted scrollbars; fix content overflow
- **Layout method**: Flex/grid preferred over JS measurement

### 12. Dark Mode & Theming
- **Dark mode**: `color-scheme: dark` on `<html>` (fixes scrollbar, inputs)
- **Theme color**: `<meta name="theme-color">` matches page background
- **Native select**: Explicit `background-color` and `color` (Windows dark mode fix)

### 13. Locale & i18n
- **Dates/times**: Use `Intl.DateTimeFormat` not hardcoded formats
- **Numbers/currency**: Use `Intl.NumberFormat` not hardcoded formats
- **Language detection**: Via `Accept-Language` / `navigator.languages`, not IP

### 14. Hydration Safety
- **Input values**: Need `onChange` (or use `defaultValue` for uncontrolled)
- **Date/time rendering**: Guard against server/client mismatch
- **Suppression**: `suppressHydrationWarning` only where truly needed

### 15. Hover & Interactive States
- **Visual feedback**: Buttons/links need `hover:` state
- **Contrast**: Interactive states increase contrast vs. resting state

### 16. Content & Copy
- **Voice**: Active voice ("Install the CLI" vs. "The CLI will be installed")
- **Capitalization**: Title Case for headings/buttons
- **Counts**: Use numerals ("8 deployments" not "eight")
- **Button labels**: Specific ("Save API Key" not "Continue")
- **Error messages**: Include fix/next step, not just problem
- **Perspective**: Second person; avoid first person
- **Ampersand**: Use `&` over "and" when space-constrained

### 17. Critical Anti-patterns (Always Flag)
- User-scalable/maximum-scale disabling zoom
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without focus-visible replacement
- Inline `onClick` navigation without `<a>`
- `<div>` or `<span>` with click handlers
- Images without explicit dimensions
- Large arrays `.map()` without virtualization
- Form inputs without labels
- Icon buttons missing `aria-label`
- Hardcoded date/number formats
- `autoFocus` without justification

## Application to Urpeer.com

This skill is critical for the Urpeer.com feedback platform, which requires:
- **Accessible feedback submission forms** with proper labels, validation, and error handling
- **Voting interactions** that work with keyboard and screen readers
- **Comment threads** with proper focus management
- **Roadmap visualization** that handles long content and empty states
- **Changelog lists** that may need virtualization for performance
- **Responsive design** for both admin and voter interfaces

**Priority Focus Areas:**
1. **Forms** - Feedback submission, comment forms, admin controls
2. **Accessibility** - All interactive voting and commenting features
3. **Performance** - Large feedback lists, roadmap views
4. **Navigation** - URL state for filters, tabs, pagination
5. **Content Handling** - User-generated feedback text with variable length

## Usage

**To run an audit:**
```bash
# Audit specific files
npx skills invoke web-design-guidelines "src/features/feedback/components/**/*.tsx"

# Audit entire feature
npx skills invoke web-design-guidelines "src/features/roadmap/**/*"
```

The skill will:
1. Fetch latest guidelines
2. Read your files
3. Check all rules
4. Output findings in `file:line` format

## Installation Location

Global installation at: `~/.agents/skills/web-design-guidelines`

## Integration with Project Standards

This skill complements Urpeer.com's existing standards:
- Works with Shadcn/ui components (ensures proper accessibility)
- Validates Tailwind CSS patterns (focus states, animations)
- Checks Next.js 15 best practices (hydration, images, navigation)
- Enforces consistent UX patterns across features

## References

- Source: https://github.com/vercel-labs/web-interface-guidelines
- Live guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

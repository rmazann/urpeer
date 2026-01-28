# Frontend Design Skill

**Installed:** 2026-01-28
**Source:** https://github.com/anthropics/skills
**Author:** Anthropic
**License:** See LICENSE.txt

## Description

Create distinctive, production-grade frontend interfaces with high design quality. This skill generates creative, polished code and UI design that avoids generic AI aesthetics and cookie-cutter patterns.

## When to Use

This skill triggers when you ask to:
- Build web components, pages, or applications
- Create websites, landing pages, or dashboards
- Design React components or HTML/CSS layouts
- Style or beautify any web UI
- Build artifacts, posters, or visual interfaces

## Core Philosophy

**Avoid Generic AI Aesthetics ("AI Slop")**
- No overused fonts (Inter, Roboto, Arial, system fonts)
- No cliched color schemes (especially purple gradients on white)
- No predictable layouts and component patterns
- No cookie-cutter design lacking context-specific character

**Embrace Bold, Distinctive Design**
- Every design should be unique and memorable
- Commit to a clear aesthetic direction
- Execute with precision and attention to detail
- Match implementation complexity to aesthetic vision

## Design Thinking Process

### 1. Understand Context
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Choose an extreme aesthetic direction (see below)
- **Constraints**: Technical requirements (framework, performance, accessibility)
- **Differentiation**: What makes this UNFORGETTABLE? What will people remember?

### 2. Choose Aesthetic Direction

Pick a bold direction and commit fully:
- Brutally minimal
- Maximalist chaos
- Retro-futuristic
- Organic/natural
- Luxury/refined
- Playful/toy-like
- Editorial/magazine
- Brutalist/raw
- Art deco/geometric
- Soft/pastel
- Industrial/utilitarian

**CRITICAL**: Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

### 3. Execute with Precision

Create working code that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

### Typography
- **Choose distinctive, beautiful fonts** that elevate aesthetics
- **Avoid**: Arial, Inter, Space Grotesk (overused)
- **Do**: Pair a distinctive display font with a refined body font
- Make unexpected, characterful font choices
- Typography should reinforce the chosen aesthetic direction

### Color & Theme
- **Commit to a cohesive aesthetic**
- Use CSS variables for consistency
- Dominant colors with sharp accents outperform timid palettes
- Avoid evenly-distributed, safe color choices
- Match colors to the chosen aesthetic direction

### Motion & Animation
- **Use animations for effects and micro-interactions**
- Prioritize CSS-only solutions for HTML
- Use Motion library for React when available
- Focus on high-impact moments:
  - One well-orchestrated page load with staggered reveals (`animation-delay`)
  - Scroll-triggering animations that surprise
  - Hover states with unexpected effects
- More delight from few orchestrated animations than scattered micro-interactions

### Spatial Composition
- **Break expectations with unexpected layouts**
- Asymmetry over symmetry
- Overlap and layering
- Diagonal flow
- Grid-breaking elements
- Generous negative space OR controlled density (depends on aesthetic)

### Backgrounds & Visual Details
- **Create atmosphere and depth** rather than defaulting to solid colors
- Add contextual effects and textures matching the overall aesthetic
- Creative forms to consider:
  - Gradient meshes
  - Noise textures
  - Geometric patterns
  - Layered transparencies
  - Dramatic shadows
  - Decorative borders
  - Custom cursors
  - Grain overlays

## Implementation Standards

### Complexity Matching
**Maximalist Designs:**
- Elaborate code with extensive animations
- Rich effects and interactions
- Layered visual elements
- Bold, attention-grabbing details

**Minimalist/Refined Designs:**
- Restrained, precise code
- Careful attention to spacing
- Refined typography
- Subtle, sophisticated details

**Key**: Elegance comes from executing the vision well, not from using fewer elements.

## Anti-Patterns to Avoid

### Generic Choices
- System fonts or overused typefaces
- Purple gradients on white backgrounds
- Standard card layouts with rounded corners
- Predictable component patterns
- Design that could be any product

### Converging on Common Choices
- NEVER use Space Grotesk, Inter across generations
- Vary between light and dark themes
- Different fonts for different projects
- Different aesthetics for different contexts
- No design should look like another

### Lack of Context
- Cookie-cutter templates
- Design disconnected from purpose
- Missing consideration of audience
- Ignoring brand personality

## Application to Urpeer.com

### Project Context
**Urpeer.com** is a centralized feedback platform for SaaS products. It needs:
- **Professional credibility** (trusted by product teams)
- **User engagement** (voters return to check roadmap, changelogs)
- **Clear hierarchy** (admin vs. voter roles)
- **Data visualization** (roadmap, voting metrics)

### Potential Aesthetic Directions

**Option 1: Editorial/Magazine Style**
- Clean typography with bold headings
- Grid-based layouts with intentional breaks
- Voting as visual emphasis
- Roadmap as editorial timeline

**Option 2: Product/Refined Minimal**
- Precision spacing and alignment
- Sophisticated micro-interactions
- Subtle state changes
- Focus on content hierarchy

**Option 3: Playful/Community-Driven**
- Warm, approachable colors
- Friendly micro-animations
- Organic shapes and flows
- Emphasis on user participation

**Option 4: Brutalist/Data-First**
- Raw, honest presentation
- Typography-heavy design
- High contrast
- Focus on information density

### Key Components to Design

**Feedback Board:**
- Card layouts that feel fresh, not generic
- Voting interactions with memorable micro-animations
- Status indicators with clear visual language
- Filtering UI with spatial creativity

**Roadmap View:**
- Timeline visualization with character
- Status progression with motion
- Milestone markers with personality
- Interactive elements with surprising details

**Changelog:**
- Article-like presentation
- Version markers with distinctive style
- Content hierarchy with typographic excellence
- Image/media handling with polish

**Comment Threads:**
- Nested conversations with clear depth
- Reply interactions with smooth transitions
- User avatars with thoughtful placement
- Action buttons with refined hover states

### Technical Integration

Works seamlessly with:
- **Next.js 15** (Server Components, App Router)
- **Tailwind CSS** (custom design tokens via CSS variables)
- **Shadcn/ui** (customize base components to match aesthetic)
- **TypeScript** (type-safe design systems)
- **Supabase** (data-driven visual states)

### Recommended Approach

1. **Choose one bold direction** based on user preference
2. **Select distinctive fonts** (Google Fonts or custom)
3. **Define CSS variables** for colors, spacing, motion timing
4. **Create signature animation patterns** for key interactions
5. **Design memorable moments**: first visit, successful vote, roadmap reveal
6. **Polish micro-interactions**: hover, focus, loading states
7. **Test across devices** ensuring aesthetic translates to mobile

## Usage

When building any frontend component for Urpeer.com:

1. **Before coding**: Identify the aesthetic direction
2. **During design**: Apply the guidelines above
3. **In implementation**: Match code complexity to vision
4. **After completion**: Review for generic patterns

The skill is automatically active and will guide all frontend development work.

## Installation Location

Global installation at: `~/.agents/skills/frontend-design`

## Philosophy

> "Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision."

This skill empowers you to create frontend interfaces that are:
- **Memorable**: People remember the design
- **Contextual**: Design serves the purpose
- **Distinctive**: Doesn't look like every other app
- **Polished**: Production-grade quality
- **Bold**: Clear point of view

## Remember

**Intentionality over intensity** - A refined minimal design executed perfectly is more memorable than a chaotic maximalist design without direction. The key is commitment to a vision and meticulous execution of every detail.

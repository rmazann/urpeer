# API Documentation

Urpeer uses Next.js Server Actions for all data operations. This document describes the available actions, their parameters, and return types.

## Authentication Actions

Location: `src/features/auth/actions/`

### login

Authenticates a user with email and password.

```typescript
login(prevState: LoginState | null, formData: FormData): Promise<LoginState>

// FormData fields:
// - email: string (required)
// - password: string (required)

// Returns:
type LoginState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}
```

### signup

Creates a new user account.

```typescript
signup(prevState: SignupState | null, formData: FormData): Promise<SignupState>

// FormData fields:
// - email: string (required)
// - password: string (required, min 6 chars)
// - full_name: string (optional)

// Returns:
type SignupState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
    full_name?: string[]
  }
}
```

### logout

Signs out the current user and redirects to home.

```typescript
logout(): Promise<never> // Redirects, never returns
```

---

## Feedback Actions

Location: `src/features/feedback/actions/`

### getFeedback

Retrieves a paginated list of feedback items with optional filtering and sorting.

```typescript
getFeedback(options?: GetFeedbackOptions): Promise<FeedbackWithAuthor[]>

type GetFeedbackOptions = {
  status?: 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'
  category?: 'feature' | 'improvement' | 'bug' | 'other'
  sort?: 'votes' | 'newest' | 'oldest'
  limit?: number
  offset?: number
}

type FeedbackWithAuthor = {
  id: string
  title: string
  description: string
  category: string
  status: string
  vote_count: number
  comment_count: number
  created_at: string
  updated_at: string
  profiles: {
    full_name: string | null
  } | null
}
```

### getFeedbackById

Retrieves a single feedback item with author details and user's vote status.

```typescript
getFeedbackById(id: string): Promise<{
  feedback: FeedbackWithAuthor | null
  hasVoted: boolean
}>
```

### createFeedback

Creates a new feedback item. Requires authentication.

```typescript
createFeedback(
  prevState: CreateFeedbackState | null,
  formData: FormData
): Promise<CreateFeedbackState>

// FormData fields:
// - title: string (required, 3-200 chars)
// - description: string (required, min 10 chars)
// - category: 'feature' | 'improvement' | 'bug' | 'other' (required)

// Returns:
type CreateFeedbackState = {
  success?: boolean
  error?: string
  feedbackId?: string
  fieldErrors?: {
    title?: string[]
    description?: string[]
    category?: string[]
  }
}
```

### updateFeedback

Updates an existing feedback item. Admin or author only.

```typescript
updateFeedback(
  feedbackId: string,
  data: UpdateFeedbackData
): Promise<UpdateFeedbackResult>

type UpdateFeedbackData = {
  title?: string
  description?: string
  category?: string
  status?: string
}

type UpdateFeedbackResult = {
  success: boolean
  error?: string
}
```

### deleteFeedback

Deletes a feedback item. Admin or author only.

```typescript
deleteFeedback(feedbackId: string): Promise<DeleteFeedbackResult>

type DeleteFeedbackResult = {
  success: boolean
  error?: string
}
```

### voteFeedback

Toggles the current user's vote on a feedback item.

```typescript
voteFeedback(feedbackId: string): Promise<VoteFeedbackResult>

type VoteFeedbackResult = {
  success: boolean
  hasVoted: boolean
  voteCount: number
  error?: string
}
```

---

## Comments Actions

Location: `src/features/comments/actions/`

### getComments

Retrieves all comments for a feedback item.

```typescript
getComments(feedbackId: string): Promise<CommentWithAuthor[]>

type CommentWithAuthor = {
  id: string
  content: string
  created_at: string
  updated_at: string
  profiles: {
    id: string
    full_name: string | null
  } | null
}
```

### createComment

Creates a new comment on a feedback item.

```typescript
createComment(
  prevState: CreateCommentState | null,
  formData: FormData
): Promise<CreateCommentState>

// FormData fields:
// - content: string (required, 1-2000 chars)
// - feedback_id: string (required, UUID)

// Returns:
type CreateCommentState = {
  success?: boolean
  error?: string
  fieldErrors?: {
    content?: string[]
  }
}
```

### updateComment

Updates an existing comment. Author only.

```typescript
updateComment(
  commentId: string,
  content: string
): Promise<UpdateCommentResult>

type UpdateCommentResult = {
  success: boolean
  error?: string
}
```

### deleteComment

Deletes a comment. Admin or author only.

```typescript
deleteComment(commentId: string): Promise<DeleteCommentResult>

type DeleteCommentResult = {
  success: boolean
  error?: string
}
```

---

## Roadmap Actions

Location: `src/features/roadmap/actions/`

### getRoadmapByStatus

Retrieves roadmap items grouped by status with linked feedback.

```typescript
getRoadmapByStatus(): Promise<RoadmapByStatus>

type RoadmapByStatus = {
  planned: RoadmapItemWithFeedback[]
  'in-progress': RoadmapItemWithFeedback[]
  completed: RoadmapItemWithFeedback[]
}

type RoadmapItemWithFeedback = {
  id: string
  title: string
  description: string | null
  status: string
  eta: string | null
  display_order: number
  created_at: string
  feedback: {
    id: string
    title: string
    vote_count: number
  } | null
}
```

### createRoadmapItem

Creates a new roadmap item. Admin only.

```typescript
createRoadmapItem(
  prevState: CreateRoadmapItemState | null,
  formData: FormData
): Promise<CreateRoadmapItemState>

// FormData fields:
// - title: string (required, min 3 chars)
// - description: string (optional)
// - status: 'planned' | 'in-progress' | 'completed' (default: 'planned')
// - eta: string (optional)
// - feedback_id: string (optional, UUID)
```

### updateRoadmapItem

Updates a roadmap item. Admin only.

```typescript
updateRoadmapItem(
  itemId: string,
  data: UpdateRoadmapItemData
): Promise<UpdateRoadmapItemResult>

type UpdateRoadmapItemData = {
  title?: string
  description?: string
  status?: string
  eta?: string
  display_order?: number
}
```

### updateRoadmapItemStatus

Updates only the status of a roadmap item (for drag-and-drop). Admin only.

```typescript
updateRoadmapItemStatus(
  itemId: string,
  status: string,
  displayOrder: number
): Promise<UpdateRoadmapItemResult>
```

### reorderRoadmapItems

Batch updates display order for multiple items. Admin only.

```typescript
reorderRoadmapItems(
  items: Array<{ id: string; display_order: number }>
): Promise<ReorderResult>

type ReorderResult = {
  success: boolean
  error?: string
}
```

### deleteRoadmapItem

Deletes a roadmap item. Admin only.

```typescript
deleteRoadmapItem(itemId: string): Promise<DeleteRoadmapItemResult>
```

---

## Changelog Actions

Location: `src/features/changelog/actions/`

### getChangelog

Retrieves paginated changelog entries (published only for non-admins).

```typescript
getChangelog(page?: number, limit?: number): Promise<{
  entries: ChangelogWithAuthor[]
  total: number
  hasMore: boolean
}>

type ChangelogWithAuthor = {
  id: string
  title: string
  content: string
  category: string
  published: boolean
  published_at: string | null
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}
```

### getChangelogById

Retrieves a single changelog entry.

```typescript
getChangelogById(id: string): Promise<ChangelogWithAuthor | null>
```

### getChangelogForRSS

Retrieves recent published entries for RSS feed generation.

```typescript
getChangelogForRSS(): Promise<ChangelogWithAuthor[]>
```

### createChangelogEntry

Creates a new changelog entry (as draft). Admin only.

```typescript
createChangelogEntry(
  prevState: CreateChangelogState | null,
  formData: FormData
): Promise<CreateChangelogState>

// FormData fields:
// - title: string (required, min 3 chars)
// - content: string (required, min 10 chars)
// - category: 'feature' | 'improvement' | 'bugfix' | 'breaking' (required)
```

### updateChangelogEntry

Updates a changelog entry. Admin only.

```typescript
updateChangelogEntry(
  entryId: string,
  data: UpdateChangelogData
): Promise<UpdateChangelogResult>

type UpdateChangelogData = {
  title?: string
  content?: string
  category?: string
  published?: boolean
}
```

### publishChangelog

Publishes a changelog entry. Admin only.

```typescript
publishChangelog(entryId: string): Promise<PublishResult>

type PublishResult = {
  success: boolean
  error?: string
}
```

### unpublishChangelog

Unpublishes a changelog entry. Admin only.

```typescript
unpublishChangelog(entryId: string): Promise<PublishResult>
```

### deleteChangelogEntry

Deletes a changelog entry. Admin only.

```typescript
deleteChangelogEntry(entryId: string): Promise<DeleteChangelogResult>
```

### linkFeedbackToChangelog

Links feedback items to a changelog entry. Admin only.

```typescript
linkFeedbackToChangelog(
  changelogId: string,
  feedbackIds: string[]
): Promise<LinkFeedbackResult>

type LinkFeedbackResult = {
  success: boolean
  error?: string
}
```

---

## Admin Actions

Location: `src/features/admin/actions/`

### getStats

Retrieves dashboard statistics. Admin only.

```typescript
getStats(): Promise<DashboardStats>

type DashboardStats = {
  totalFeedback: number
  openFeedback: number
  totalVotes: number
  totalUsers: number
  feedbackByStatus: Array<{ status: string; count: number }>
  recentFeedback: FeedbackWithAuthor[]
}
```

### getFeedbackList

Retrieves all feedback for admin management table.

```typescript
getFeedbackList(): Promise<FeedbackWithAuthor[]>
```

### getChangelogList

Retrieves all changelog entries for admin management.

```typescript
getChangelogList(): Promise<ChangelogWithAuthor[]>
```

---

## REST API Endpoints

### Health Check

```
GET /api/health

Response:
{
  "status": "healthy",
  "database": "connected",
  "responseTime": "45ms",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "version": "0.1.0"
}
```

### RSS Feed

```
GET /api/changelog/rss

Content-Type: application/xml

Returns RSS 2.0 feed of published changelog entries.
```

### Sitemap

```
GET /sitemap.xml

Content-Type: application/xml

Returns dynamic XML sitemap including:
- Static pages
- Published changelog entries
- Public feedback items
```

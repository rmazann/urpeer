export type { Database } from './database.types'
import type { Database } from './database.types'

// Table row types
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type RoadmapItem = Database['public']['Tables']['roadmap_items']['Row']
export type ChangelogEntry = Database['public']['Tables']['changelog_entries']['Row']
export type ChangelogFeedbackLink = Database['public']['Tables']['changelog_feedback_links']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

// Insert types
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type RoadmapItemInsert = Database['public']['Tables']['roadmap_items']['Insert']
export type ChangelogEntryInsert = Database['public']['Tables']['changelog_entries']['Insert']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']

// Update types
export type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']
export type RoadmapItemUpdate = Database['public']['Tables']['roadmap_items']['Update']
export type ChangelogEntryUpdate = Database['public']['Tables']['changelog_entries']['Update']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Extended types with relations
export type FeedbackWithAuthor = Feedback & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  user_has_voted?: boolean
}

export type FeedbackWithDetails = Feedback & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  comments: CommentWithAuthor[]
  user_has_voted?: boolean
}

export type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type RoadmapItemWithFeedback = RoadmapItem & {
  feedback: Feedback | null
}

export type ChangelogEntryWithDetails = ChangelogEntry & {
  profiles: Pick<Profile, 'id' | 'full_name'>
  changelog_feedback_links: {
    feedback: Pick<Feedback, 'id' | 'title'>
  }[]
}

// Enum types
export type FeedbackStatus = 'open' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'closed'
export type FeedbackCategory = 'feature' | 'improvement' | 'bug' | 'other'
export type RoadmapStatus = 'planned' | 'in_progress' | 'completed'
export type ChangelogCategory = 'feature' | 'improvement' | 'bugfix' | 'breaking'
export type UserRole = 'admin' | 'voter'

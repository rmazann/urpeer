-- Performance indexes for feedback table
CREATE INDEX idx_feedback_workspace ON feedback(workspace_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_vote_count ON feedback(vote_count DESC);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_author ON feedback(author_id);

-- Performance indexes for votes table
CREATE INDEX idx_votes_feedback ON votes(feedback_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- Performance indexes for roadmap_items table
CREATE INDEX idx_roadmap_workspace ON roadmap_items(workspace_id);
CREATE INDEX idx_roadmap_status ON roadmap_items(status);
CREATE INDEX idx_roadmap_display_order ON roadmap_items(display_order);

-- Performance indexes for changelog_entries table
CREATE INDEX idx_changelog_workspace ON changelog_entries(workspace_id);
CREATE INDEX idx_changelog_published ON changelog_entries(published, published_at DESC);

-- Performance indexes for comments table
CREATE INDEX idx_comments_feedback ON comments(feedback_id);
CREATE INDEX idx_comments_author ON comments(author_id);

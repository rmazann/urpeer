-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_feedback_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Workspaces Policies
-- ============================================
CREATE POLICY "Workspaces are viewable by everyone"
  ON workspaces FOR SELECT
  USING (true);

CREATE POLICY "Workspaces can be created by authenticated users"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspaces can be updated by owner"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces can be deleted by owner"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- Profiles Policies
-- ============================================
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Feedback Policies
-- ============================================
CREATE POLICY "Feedback is viewable by everyone"
  ON feedback FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authors can delete their own feedback"
  ON feedback FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any feedback"
  ON feedback FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Votes Policies
-- ============================================
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Roadmap Policies (Admin only for write operations)
-- ============================================
CREATE POLICY "Roadmap items are viewable by everyone"
  ON roadmap_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can create roadmap items"
  ON roadmap_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update roadmap items"
  ON roadmap_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete roadmap items"
  ON roadmap_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Changelog Policies (Admin only for write operations)
-- ============================================
CREATE POLICY "Published changelog entries are viewable by everyone"
  ON changelog_entries FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all changelog entries"
  ON changelog_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create changelog entries"
  ON changelog_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update changelog entries"
  ON changelog_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete changelog entries"
  ON changelog_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Changelog Feedback Links Policies
-- ============================================
CREATE POLICY "Changelog links are viewable by everyone"
  ON changelog_feedback_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can create changelog links"
  ON changelog_feedback_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete changelog links"
  ON changelog_feedback_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Comments Policies
-- ============================================
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
